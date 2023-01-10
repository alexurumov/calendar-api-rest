/*
Helper method to filter User object
*/
type DataType = {password: string, __v: string | number, userData: unknown }
 // todo: replace
export const filterObject = (data: DataType) => { // todo: fix
    const { password, __v, ...userData } = data;
    return userData;
} // todo: fix