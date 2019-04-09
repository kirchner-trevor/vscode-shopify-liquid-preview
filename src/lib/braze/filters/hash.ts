export default {
    // usage: {{ hash | property_accesor: 'key' }}
    property_accessor: (hash: object, key: string) => {
        return hash[key];
    },
}