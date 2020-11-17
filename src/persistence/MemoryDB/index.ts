import Collection from "./collections";

/**
 * A in-memory Storage for quick data persistence
 * Using a Collection - Document type storage
 */
class MemoryDB {
    /**
     * List of collections present in the DB
     */
    private collections: Collection[]

    constructor() {
        this.collections = []
    }

    /**
     * Creates a new collection
     * @param _name name of the collection to be created
     * @param _schema schema definition describing the looks of the collection's data
     * @returns object of type **Collection**
     */
    newCollection(_name: string, _schema: object): Collection {
        /**
         * Newly created `collection`
         */
        const collection = new Collection(_name, _schema);

        /**
         * Log out a `collection` created successful message
         */
        console.log(`${collection.name} collections created!`)

        /**
         * Add newly created `collection` to DB's `collection` list
         */
        this.collections.push(collection)

        /**
         * Return newly created collection
         */
        return collection;
    }

    /**
     * Retrieve or get a collection from the MemoryDB
     * @param _name name of the collection to be retrieved
     * @return an object of type **Collection**
     */
    collection(_name: string): Collection | undefined {
        return this.collections.filter(collection => collection.name === _name)[0] || undefined;
    }

    /**
     * Get list of all collections in the DB
     * @return an array of **Collections**
     */
    getCollections(): Collection[] {
        return this.collections;
    }
}

export default new MemoryDB();