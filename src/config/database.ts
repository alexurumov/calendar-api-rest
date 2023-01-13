import mongoose  from 'mongoose';
import * as dotenv from "dotenv";
dotenv.config();

const DB_CONNECTION_STRING: string = process.env.DB_CONNECTION_STRING || 'mongodb://localhost:27017';
const DB_NAME: string = process.env.DB_NAME || 'calendar-api';
const TEST_DB_NAME: string = 'test-api';

export const databaseConfig = async () => {
    mongoose.connect(`${DB_CONNECTION_STRING}/${TEST_DB_NAME}`, {}, (err) => {
        if (err) {
            console.log('>>> DB Error: ' + err)
        } else {
            console.log('DB Connected!');
        }
    });
};