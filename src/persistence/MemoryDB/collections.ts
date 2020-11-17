import * as uuid from "uuid";

/**
 * Collection Document (single) interface
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
 * A container for storing Documents (Javascript key-pair values)
 * @param _name name of the collection
 * @param _schema a definition that describes how each document in a collection should look like
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
            statics: {}
        }
    }

    /**
     * Get all `documents` in the collection
     * @returns An Array of Documents
     */
    getAll(): Doc[] {
        return this.docs;
    }

    /**
     * Get a single `documents` in the collection
     * @param _id id of the `document` to be fetched
     * @returns a `document` of type {@link Doc}
     */
    getOne(_id: string): Doc | undefined {
        return this.docs.filter(doc => doc._id === _id)[0] || undefined;
    }

    /**
     * Gets a `document` by it's name
     * @param _name name property value of the element to be fetched
     * @returns an `document` object
     */
    getByName(_name: string): Doc | undefined {
        return this.docs.filter(doc => doc.name === _name)[0] || undefined;
    } 

    /**
     * Creates a new `document` in the current `collection`
     * @param _data data to create new `document` from
     */
    createOne(_data: any): object {
        /**
         * Get current object context
         */
        const ctx = this;

        /**
         * Create an `id` with the `uuid.v4()`
         */
        const id = uuid.v4();

        /**
         * Create new document and init `id`, `update`, `save` and `timestamp` value
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
         * declare an iterator key `attribute`
         */
        let attribute: string;

        /**
         * parse only attribute value defined in the `collection` schema
         */
        for (attribute in _data) {
            for(attribute in this.schema) {
                if(this._isInternals(attribute)) {
                    doc = { ...doc, ...this._loadInternals(doc, attribute, this.schema[attribute]) } 
                }else {
                    doc = { ...doc, [attribute]: this._validateSchema(attribute, _data[attribute]) }
                }
            }
        }

        /**
         * Add new `doc` to collection's `doc` array
         */
        this.docs.push(doc)

        /**
         * return newly created `doc`
         */
        return doc;
    }

    /**
     * Update a `document` in the `collection` `document` list 
     * by providing its `id` and `data` to update it with
     * @param _id `id` of `doc` to be updated
     * @param _data `data` to update `doc` with
     */
    updateOne(_id: string, _data: any): Doc {
        /**
         * Doc to be updated
         */
        let doc = this.getOne(_id);

        /**
         * Check if doc exist, if not throw an exception
         */
        if(!doc) throw new Error("Doc not found");

        /**
         * Iterator for `doc` object
         */
        let attribute: any;
        
        /**
         * Iterate `docs` and set value to it's corresponding `_data` update
         */
        for(attribute in doc) {

            /**
             * Re-assign `docs` to `docs` with new prop 
             * with its validated value as its value
             * TODO: skip internals update
             */
            doc = { ...doc, [attribute]: this._validateSchema(attribute, _data[attribute]) }
        }

        /**
         * Update the collection's `docs` with newly updated `doc` 
         */
        this.docs = this.docs.map(d => d._id !== doc._id ? d : doc)

        /**
         * return `docs`
         */
        return doc;
    }

    
    _isInternals(_attribute: string): boolean {
        for(let attribute in this._internals) {
            if(attribute === _attribute) return true;
        }
        return false;
    }

    _loadInternals(_this: Doc, _internalKey: string, _internals: object): object {
        let internals = null;
        switch(_internalKey) {
            case "methods":
                internals = { ...this._loadInternalMethods(_this, _internals) };
                break;
            default:
                internals = {}
        }
        return internals;
    }

    _loadInternalMethods(_this: Doc, _methods: any): object {
        let  methods: object = {}
        let method: string;
        for(method in _methods) {
            const m = method;
            methods = { 
                ...methods, 
                [method]: function (...params: any) {
                    return _methods[m].call(this, ...params)
                }
            }
        }

        return methods;
    }

    _validateSchema(_schemaProp: string, _schemaValue: any): any {
        try{
            const schema = this.schema[_schemaProp];
            let validValue = _schemaValue || schema["default"];
            for ( let rule in schema ) {
                validValue = this._validateSchemaRule(rule, schema[rule], validValue);
                if(!validValue) throw new Error(`Invalid param: ${_schemaValue} of ${rule}`);
            }

            return validValue;
        }catch(e) {
            throw e
        }
    }

    _validateSchemaRule(_schemaRule: string, _ruleValue: any, value: any): boolean | any {
        let isValid: boolean | any = value;
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

        return isValid;
    } 

    _validateType(value: any, _ruleValue: string): boolean {
        if(_ruleValue.toLowerCase() === "array")
            return typeof value === "object" && value.hasOwnProperty("length")

        if(_ruleValue.toLowerCase() === "date")
            return !!(typeof value === "object" && isNaN(new Date(value).getDate()))

        return typeof value === _ruleValue;
    }
}

export default MemoryDbCollection;