import {model, Schema} from "mongoose";
import bcrypt from "bcrypt";
import {Meeting} from "./Meeting";

export class User {
    _id?: string | number;
    username?: string;
    password?: string;
    meetings?: Meeting[];
}

const schema = new Schema({
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
schema.pre('save', async function (next) {
    try {
        console.log('only for testing pass:')
        console.log(this.password)
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }
    catch (err) {
        next(err as NativeError);
    }
})

schema.methods = {
    matchPassword: function (password: string) {
        return bcrypt.compare(password, this.password);
    }
}

export const userModel = model("User", schema);
