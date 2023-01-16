import {model, Schema} from "mongoose";
import {ITest} from "../../interfaces";

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
