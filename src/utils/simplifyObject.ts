export const simplifyObject = (data: unknown) => {
    return JSON.parse(JSON.stringify(data)); 
} // todo: fix