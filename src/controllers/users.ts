import {Request, Response} from "express";
import { UserModel } from '../models/User';
import * as dotenv from 'dotenv';
import jwt from "jsonwebtoken";

import {bsonConvertObject, filterObject} from "../utils";

dotenv.config();
const TOKEN_SECRET = process.env.TOKEN_SECRET as string;
const COOKIE_NAME = process.env.COOKIE_NAME as string;


export async function register(req: Request, res: Response) {
    const user = new UserModel(req.body);

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

        // TODO: Temporarily disable auth and send only the userId to the request
        const token = jwt.sign(filteredUser, TOKEN_SECRET, { expiresIn: '1d' });
        // res.cookie(COOKIE_NAME, token, { httpOnly: true });
        if (!req.user) {
            req.user = {
                _id: user._id.toString()
            }
        }
        //
        return res.status(200).json(filteredUser);
    }
    catch (err: any) {

        // TODO: find an appropriate error type
        /*
        If Error is with code 11000, then the DB restriction for "unique" has been violated! 
        */
        // if (err.code === 11000) {
        //     const { keyValue } = err;
        //
        //     res.status(409)
        //         .send({ message: `This ${Object.keys(keyValue)[0]} is already registered!` });
        //     return;
        // }
        /*
        Other errors are a result of validation of fields. In this case - "required"!
        */
        res.status(409)
            .send({
                message: err.message
                    // .replace('User validation failed: ', '')
                    // .split(", ")
                    // .map(msg => msg.split(": ")[1])
                    // .join("; ")
            });
        return;
    }
}

export async function login(req: Request, res: Response) {
    const { username, password } = req.body;
    const existing = await UserModel.findOne({ username });
    
    if (!existing || !password || password.trim() === '') {
        res.status(401).json({ message: 'Wrong login credentials!' });
        return;
    }

    const matchPass = await existing.matchPassword(password);
    
    if (!matchPass) {
        res.status(401).json({ message: 'Wrong login credentials!' });
        return;
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
    // TODO: Temporarily disable auth and send only the userId to the request
    // const token = jwt.sign(filteredUser, TOKEN_SECRET, { expiresIn: '1d' });
    // res.cookie(COOKIE_NAME, token, { httpOnly: true });
    if (!req.user) {
        req.user = {
            _id: existing._id.toString()
        }
    }
    return res.status(200).json(filteredUser);
}

export function logout(req: Request, res: Response) {
    /*
    We clear the cookie, so no logged user data is stored! 
    */
    // TODO: Temporarily disable auth and send only the userId to the request
    // res.clearCookie(COOKIE_NAME);
    req.user = undefined;
    res.status(204).json({ message: 'Logged out!' });
}

