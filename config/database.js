const mongoose = require('mongoose');
require('dotenv').config();
const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING || 'mongodb://root:passroot@localhost:27017';

module.exports = (app) => {
    return new Promise((resolve, reject) => {
        mongoose.connect(DB_CONNECTION_STRING, {
            dbName: 'calendar-api',
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    
        const db = mongoose.connection;
        db.on('error', err => {
            console.error('Database error: ', err.message);
            reject(err.message);
        });
        db.on('open', () => {
            console.log('>>> Database connected!');
            resolve();
        });
    });
};