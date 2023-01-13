import {model, Schema} from "mongoose";
import {IMeeting, MeetingModel} from "./Meeting";
import * as dotenv from 'dotenv';
import {IUser} from "./interfaces/IUser";
import {hashPass} from "../utils/crypto.util";
dotenv.config();

interface IUserMethods {
    matchPassword(password: string): boolean;
}


const userSchema = new Schema<IUser, IUserMethods>({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    meetings: [
        {
            type: Schema.Types.ObjectId,
            ref: "Meeting"
        }
    ],
});

/*
Hashing password before storing object in DB!
 */
userSchema.pre('save', async function (next) {
    try {
        // this.password = await bcrypt.hash(this.password, 10);
        this.password = hashPass(this.password);
        next();
    }
    catch (err) {
        next(err as NativeError);
    }
})

userSchema.method('matchPassword', function (password: string): boolean {
    return hashPass(password) === this.password;
})

export const UserModel = model<IUser>('User', userSchema);
