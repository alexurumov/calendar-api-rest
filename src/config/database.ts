import mongoose  from 'mongoose';

export const databaseConfig = async () => {
    mongoose.connect('mongodb://127.0.0.1:27017/test-api', {}, (err) => {
        if (err) {
            console.log('DB Error' + err)
        } else {
            console.log('DB Connected! ')
        }
    });
};