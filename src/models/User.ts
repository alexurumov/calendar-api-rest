import {Model, model, Schema, Types} from "mongoose";
import {IMeeting, MeetingModel} from "./Meeting";
import CryptoJS from "crypto-js/core";

export interface IUser {
    _id?: Types.ObjectId;
    username: string;
    password: string;
    meetings: Types.Array<IMeeting>
}

interface IUserMethods {
    matchPassword(password: string): boolean;
}

type UserModel = Model<IUser, {}, IUserMethods>

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
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
        this.password = CryptoJS.HmacSHA256(this.password, 'calendar-api-secret-key').toString();
        next();
    }
    catch (err) {
        next(err as NativeError);
    }
})

userSchema.method('matchPassword', function (password: string): boolean {
    return CryptoJS.HmacSHA256(password, 'calendar-api-secret-key').toString() === this.password;
})

export const UserModel = model<IUser, UserModel>('User', userSchema);
