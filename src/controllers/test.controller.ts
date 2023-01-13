import {Request, Response} from "express";
import {TestModel} from "../models";
import {ITest} from "../interfaces";
import {HydratedDocument} from "mongoose";
export async function testDB(req: Request, res: Response) {
    const newTest: HydratedDocument<ITest> = new TestModel({
        name: 'record-2'
    });

    try {
        await newTest.save();

    } catch (e: any) {
        console.log(e.message);
    }

    let tests: HydratedDocument<ITest>[] = await TestModel.find();
    res.status(200).json(tests);
}
