export const bsonConvertObject = (data: unknown) => {
    return JSON.parse(JSON.stringify(data)); 
} // todo: fix