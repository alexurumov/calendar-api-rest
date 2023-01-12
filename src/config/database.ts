import mongoose, {ConnectOptions} from 'mongoose';

const DB_CONNECTION_STRING: string = process.env.DB_CONNECTION_STRING as string || 'mongodb://localhost:27017/calendar-api';

export const databaseConfig = async () => {
    mongoose.connect('mongodb://127.0.0.1:27017/', {}, (err) => {
        if (err) {
            console.log('DB Error' + err)
        } else {
            console.log('DB Connected! ')
        }
    });
};