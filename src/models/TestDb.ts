import mongoose, {model, Schema, Types} from "mongoose";
import {ITest} from "./interfaces/ITest";

const testSchema = new Schema<ITest>({
    name: {
        type: String,
        required: true,
        unique: true
    },
    message: {
        type: String,
    },

})

export const TestModel = model<ITest>('Test', testSchema);
