const { User } = require('../models');
const jwt = require("jsonwebtoken");
require('dotenv').config();
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'Some default secret!';
const COOKIE_NAME = process.env.COOKIE_NAME || 'AUTH_COOKIE';
const { filterObject, bsonConvertObject } = require('../utils');

async function register(req, res) {
    const user = new User(req.body);

    try {
        /*
        Trying to save the user in the DB, so DB validation rules can be applied! 
        */
        const savedUser = await user.save();
        /*
        Simplifying the object. 
        */
        const convertedUser = bsonConvertObject(savedUser);
        /*
        Removing the sensitive and non-related props from the User object, so we can return safely to the client! 
        */
        const filteredUser = filterObject(convertedUser);
        /*
        If user has been successfully stored in DB, we generate JWT token from the filtered user object and pass it through a cookie. 
        */
        const token = jwt.sign(filteredUser, TOKEN_SECRET, { expiresIn: '1d' });
        res.cookie(COOKIE_NAME, token, { httpOnly: true });
        return res.status(200).json(filteredUser);
    }
    catch (err) {
        /*
        If Error is with code 11000, then the DB restriction for "unique" has been violated! 
        */
        if (err.code === 11000) {
            const { keyValue } = err;

            res.status(409)
                .send({ message: `This ${Object.keys(keyValue)[0]} is already registered!` });
            return;
        }
        /*
        Other errors are a result of validation of fields. In this case - "required"!
        */
        res.status(409)
            .send({
                message: err.message
                    .replace('User validation failed: ', '')
                    .split(", ")
                    .map(msg => msg.split(": ")[1])
                    .join("; ")
            });
        return;
    }
}

async function login(req, res) {
    debugger;
    const { username, password } = req.body;

    const existing = await User.findOne({ username });

    /*
    If username and password do not match, we return error message to client!
    */
    if (!existing || !password || !existing.matchPassword(password)) {
        res.status(401).json({ message: 'Wrong login credentials!' });
    }

    /*
    Simplifying the object. 
    */
    const convertedUser = bsonConvertObject(existing);
    /*
    Removing the sensitive and non-related props from the User object, so we can return safely to the client! 
    */
    const filteredUser = filterObject(convertedUser);

    /*
    If user authentication has been successful, we generate JWT token from the filtered user object and pass it through a cookie. 
    */
    const token = jwt.sign(filteredUser, TOKEN_SECRET, { expiresIn: '1d' });
    res.cookie(COOKIE_NAME, token, { httpOnly: true });
    return res.status(200).json(filteredUser);
}

function logout(req, res) {
    /*
    We clear the cookie, so no logged user data is stored! 
    */
    res.clearCookie(COOKIE_NAME);
    res.status(204).json({ message: 'Logged out!' });
}

module.exports = {
    register,
    login,
    logout
}
