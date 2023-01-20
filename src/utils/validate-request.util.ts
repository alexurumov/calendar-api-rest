import {validate} from "class-validator";
import {Response} from "express";

export async function validateRequestBody<T extends Object>(dto: T, res: Response): Promise<boolean> {
    const errors = await validate(dto);
    if (errors.length) {
        res.status(401).json(errors.map(err => {
            for (const constraintsKey in err.constraints) {
                return err.constraints[constraintsKey];
            }
        }));
        return false;
    }
    return true;
}



