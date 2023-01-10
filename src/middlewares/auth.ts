import {filterObject} from "../utils/filterObject";
import {bsonConvertObject} from "../utils/bsonConvertObject";

import {userModel as User} from "../models/User";

import jwt from "jsonwebtoken";
import {NextFunction, Request, Response} from "express";

const TOKEN_SECRET = process.env.TOKEN_SECRET as string;
const COOKIE_NAME = process.env.COOKIE_NAME as string;

/*
Middleware that checks if there is a logged in user and if it's JWT token is valid
*/
export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies[COOKIE_NAME];
        if (!token) {
            next();
            return;
        }
        const jwtPayload = jwt.verify(token, TOKEN_SECRET);
        let _id = '';
        if (typeof jwtPayload === 'string') {
            console.log(`string ${jwtPayload}`);
            _id = jwtPayload;
        } else  {
            console.log(`jwtPayload ${jwtPayload}`);
            _id = jwtPayload._id;
        }
        const user = await User.findById({ _id }).populate('meetings');
        /*
        Simplifying the object. 
        */
        const convertedUser = bsonConvertObject(user);
        /*
        Removing the sensitive and non-related props from the User object, so we can return safely to the client! 
        */
        req.body.user = filterObject(convertedUser);
        next();
    } catch (err) {
        res.status(401).send({ message: "Invalid token!" });
    }
}