/*
Helper method to filter User object
*/
module.exports = (data) => {
    const { password, __v, ...userData } = data;
    return userData;
}