import {filterObject} from "../utils/filterObject";
import {bsonConvertObject} from "../utils/bsonConvertObject";
import {IUser, UserModel} from "../models/User";
import jwt from "jsonwebtoken";
import {NextFunction, Request, Response} from "express";
import * as dotenv from "dotenv";
dotenv.config();


const TOKEN_SECRET: string = process.env.TOKEN_SECRET || 'Calendar Api Secret!';
const COOKIE_NAME: string = process.env.COOKIE_NAME || 'calendar-api-cookie-name';

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
        // const user = await UserModel.findById({ _id }).populate('meetings');
        /*
        Simplifying the object. 
        */
        // const convertedUser = bsonConvertObject(user);
        /*
        Removing the sensitive and non-related props from the User object, so we can return safely to the client! 
        */

        //TODO: add user to request

        next();
    } catch (err) {
        res.status(401).send({ message: "Invalid token!" });
    }
}