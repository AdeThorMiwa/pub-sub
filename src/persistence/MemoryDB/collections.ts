import * as uuid from "uuid";

/**
 * Collection Document (single) interface.
 */
export interface Doc {
    _id: string;
    name?: string;
    update(_data: any): Doc;
    save(): void;
    methods?: any;
    timestamp: Date
}

/**
 * A container for storing Documents (Javascript key-pair values).
 * @param _name name of the collection.
 * @param _schema a definition that describes how each document in a collection should look like.
 */
class MemoryDbCollection {
    public name: string;
    public schema: object | any;
    private docs: Doc[];
    private _internals: object;

    constructor(_name: string, _schema: object) {
        this.name = _name;
        this.schema = _schema;
        this.docs = [];
        this._internals = {
            methods: {},
        }
    }

    /**
     * Get all `documents` in the collection.
     * @returns An Array of `Documents`.
     */
    getAll(): Doc[] {
        return this.docs;
    }

    /**
     * Get a single `documents` in the collection.
     * @param _id id of the `document` to be fetched.
     * @returns a `document` of type {@link Doc}.
     */
    getOne(_id: string): Doc | undefined {
        return this.docs.filter(doc => doc._id === _id)[0] || undefined;
    }

    /**
     * Gets a `document` by it's name.
     * @param _name name property value of the element to be fetched.
     * @returns a `document` object.
     */
    getByName(_name: string): Doc | undefined {
        return this.docs.filter(doc => doc.name === _name)[0] || undefined;
    } 

    /**
     * Creates a new `document` in the current `collection`.
     * @param _data data to create new `document` from.
     */
    createOne(_data: any): object {
        /**
         * class context.
         */
        const ctx = this;

        /**
         * An `id` created with the `uuid.v4()`.
         */
        const id = uuid.v4();

        /**
         * Create new `document` and init `id`, `update`, `save` and `timestamp` value.
         */
        let doc: Doc = {
            _id: id,
            update: (_data: any) => ctx.updateOne(id, _data),
            save: function () {
                return ctx.updateOne(this._id, this)
            },
            timestamp: new Date()
        }

        /**
         * declare an iterator key `attribute`.
         */
        let attribute: string;

        /**
         * parse only attribute value defined in the `collection` schema.
         */
        for (attribute in _data) {
            for(attribute in this.schema) {
                if(this._isInternals(attribute)) {
                    doc = { ...doc, ...this._loadInternals(attribute, this.schema[attribute]) } 
                }else {
                    doc = { ...doc, [attribute]: this._validateSchema(attribute, _data[attribute]) }
                }
            }
        }

        /**
         * Add new `document` to collection's `document` array.
         */
        this.docs.push(doc)

        /**
         * return newly created `document`.
         */
        return doc;
    }

    /**
     * Update a `document` in the `collection` `document` list,
     * by providing its `id` and `data` to update it with.
     * @param _id `id` of `document` to be updated.
     * @param _data `data` to update `document` with.
     */
    updateOne(_id: string, _data: any): Doc {
        /**
         * `document` to be updated.
         */
        let doc = this.getOne(_id);

        /**
         * Check if `document` exist, if not throw an exception.
         */
        if(!doc) throw new Error("Doc not found");

        /**
         * Iterator for `document` object.
         */
        let attribute: any;
        
        /**
         * Iterate `documents` and set value to it's corresponding `_data` update.
         */
        for(attribute in doc) {

            /**
             * Re-assign `document` to `document` with new prop.
             * with its validated value as its value.
             * TODO: skip internals update.
             */
            doc = { ...doc, [attribute]: this._validateSchema(attribute, _data[attribute]) }
        }

        /**
         * Update the collection's `documents` with newly updated `document`.
         */
        this.docs = this.docs.map(d => d._id !== doc._id ? d : doc)

        /**
         * return `document`.
         */
        return doc;
    }

    /**
     * Checks if attribute is been used internally by MemoryDB.
     * @param _attribute the attribute to be checked.
     * @returns a boolean value of the check.
     */
    _isInternals(_attribute: string): boolean {

        /**
         * Iterate the internals and check to see if attribute exist.
         * if it does, return true.
         */
        for(let attribute in this._internals) {
            if(attribute === _attribute) return true;
        }

        /**
         * Else if attribute is not an internal return false.
         */
        return false;
    }

    /**
     * Load internal `variables` or `methods` defined on the collection's `schema`.
     * @param _internalKey the key of the internal to be loaded.
     * @param _internals the values of the internals to be loaded.
     * @returns an object containing loaded internals.
     */
    _loadInternals(_internalKey: string, _internals: object): object {

        /**
         * Internals to be returned.
         */
        let internals;

        /**
         * Check against internal type.
         */
        switch(_internalKey) {
            case "methods":
                internals = { ...this._loadInternalMethods(_internals) };
                break;
            default:
                internals = {}
        }

        /**
         * Return internals.
         */
        return internals;
    }

    /**
     * Load internal methods defined on the collection's `schema`.
     * @param _methods internal methods to be loaded on the current `document`.
     */
    _loadInternalMethods(_methods: any): object {
        
        /**
         * Object containing method being loaded.
         */
        let methods: object = {}

        /**
         * Iterator key of `_methods` object.
         */
        let method: string;

        /**
         * Iterate the `_methods` and add them into the `methods` object on each iteration.
         */
        for(method in _methods) {

            /**
             * Key of the current method been loaded.
             */
            const key = method;

            /**
             * Add new method to `methods` object by spreading previously loaded methods,
             * and the current method.
             */
            methods = { 
                ...methods, 

                /**
                 * Add method to `methods` object and call it with the current caller object.
                 * @param params any parameter passed by the method caller.
                 */
                [method]: function (...params: any) {
                    return _methods[key].call(this, ...params)
                }
            }
        }

        /**
         * Return loaded methods.
         */
        return methods;
    }

    /**
     * Validates the value of a schema property with it's schema definition.
     * @param _schemaProp schema property to be validated.
     * @param _schemaValue schema value to be validated.
     */
    _validateSchema( _schemaProp: string, _schemaValue: any ): any {
        /**
         * Schema definition of the current schema property to be validated.
         */
        const schema = this.schema[_schemaProp];

        /**
         * Current `document`'s value.
         * 
         * NOTE: if value is undefined it uses the default value defined in it's schema.
         */
        let validValue = _schemaValue || schema["default"];

        /**
         * Schema rule of current schema iteration.
         */
        let rule: any;

        /**
         * Iterate schema to check value against every rule in it's definition.
         */
        for ( rule in schema ) {

            /**
             * Re-assign `validValue` to it's validation value .
             */
            validValue = this._validateSchemaRule(rule, schema[rule], validValue);

            /**
             * if `validValue`'s value after validation is a falsy value,
             * throw an `Invalid Params` exception.
             */
            if(!validValue) throw new Error(`Invalid param: ${_schemaValue} of ${rule}`);
        }

        /**
         * Return validated value.
         */
        return validValue;
    }

    /**
     * Validate a schema's rule for a given value.
     * @param _schemaRule schema rule to be validated.
     * @param _ruleValue schema rule's value to be compared.
     * @param value current `document`'s value to be validated.
     */
    _validateSchemaRule(_schemaRule: string, _ruleValue: any, value: any): boolean | any {
        /**
         * validated value of current `document`.
         */
        let isValid: boolean | any = value;

        /**
         * Check rule against possible rule set,
         * if match found, then perform match rule set defined validations.
         */
        switch(_schemaRule) {
            case "type":
                isValid = this._validateType(value, _ruleValue) ? value : false;
                break;
            case "required":
                if(_ruleValue)
                    isValid = value && value.toString().trim().length > 0 ? value : false;
                break;
            case "trim":
                if(_ruleValue)
                    isValid = value.trim();
                break;
            case "toLower":
                if(_ruleValue)
                    isValid = value.toLowerCase();
                break;
            case "toUpper":
                if(_ruleValue)
                    isValid = value.toUpperCase();
                break;
            case "default":
                isValid = isValid;
                break;
        }

        /**
         * Return validated value.
         */
        return isValid;
    } 

    /**
     * Validate a value for a specific data type
     * @param value value of current `document` to be validated
     * @param _ruleValue a string containing the data type `value` should be validated against
     */
    _validateType(value: any, _ruleValue: string): boolean {

        /**
         * check for type array
         */
        if(_ruleValue.toLowerCase() === "array")
            return typeof value === "object" && value.hasOwnProperty("length")

        /**
         * check for type date
         */
        if(_ruleValue.toLowerCase() === "date")
            return !!(typeof value === "object" && isNaN(new Date(value).getDate()))

        /**
         * Other type checks
         */
        return typeof value === _ruleValue;
    }
}

export default MemoryDbCollection;