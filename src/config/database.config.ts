import mongoose, {ConnectOptions} from 'mongoose';
import * as dotenv from "dotenv";
dotenv.config();

const DB_CONNECTION_STRING: string = process.env.DB_CONNECTION_STRING || 'mongodb://localhost:27018';
const DB_NAME: string = process.env.DB_NAME as string;
const DB_USERNAME: string = process.env.DB_USERNAME as string;
const DB_PASS: string = process.env.DB_PASS as string;
const TEST_DB_NAME: string = 'test-api';

export const databaseConfig = async () => {
    const _uri = `mongodb://${DB_CONNECTION_STRING}/${DB_NAME}`
    try {
        await mongoose.connect(_uri, {
            authSource: "admin",
            user: DB_USERNAME,
            pass: DB_PASS
        });
        console.log('DB Connected!');
    } catch (err) {
        console.log('>>> DB Error: ' + err)
    }
};