import mongoose, {ConnectOptions} from 'mongoose';

const DB_CONNECTION_STRING: string = process.env.DB_CONNECTION_STRING as string;

export const database = async () => {
    let options: ConnectOptions = {
        dbName: 'calendar-api',
        user: 'root',
        pass: 'passroot'
    };
    const connection = await mongoose.createConnection(DB_CONNECTION_STRING, options);

    connection.on('error', err => {
        console.error('Database error: ', err.message);
    });
    connection.on('open', () => {
        console.log('>>> Database connected!');
    });
};