const { User } = require('../models');
const jwt = require("jsonwebtoken");
require('dotenv').config();
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'Some default secret!';
const COOKIE_NAME = process.env.COOKIE_NAME || 'AUTH_COOKIE';
const {filterObject, bsonConvertObject} = require('../utils');

/*
Middleware that checks if there is a logged in user and if it's JWT token is valid
*/
module.exports = () => async (req, res, next) => {
    try {
        const token = req.cookies[COOKIE_NAME];
        const { _id } = jwt.verify(token, TOKEN_SECRET);
        const user = await User.findById({ _id }).populate('meetings');
        /*
        Simplifying the object. 
        */
        const convertedUser = bsonConvertObject(user);
        /*
        Removing the sensitive and non-related props from the User object, so we can return safely to the client! 
        */
        const filteredUser = filterObject(convertedUser);
        req.user = filteredUser;
        next();
    } catch (err) {
        res.status(401).send({ message: "Invalid token!" });
    }
}