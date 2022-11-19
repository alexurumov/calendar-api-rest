const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const COOKIE_NAME = process.env.COOKIE_NAME || 'AUTH_COOKIE';

module.exports = (app) => {
    app.use(express.json());
    app.use(cookieParser(COOKIE_NAME));    
}