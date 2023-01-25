import { validate } from 'class-validator';
import createHttpError from 'http-errors';

export async function validateRequestBody<T extends Object> (dto: T): Promise<void> {
    const errors = await validate(dto);

    if (errors.length) {
        let result: string = '';
        errors.forEach((err) => {
            for (const constraintsKey in err.constraints) {
                result += `${err.constraints[constraintsKey]}; `;
            }
        });
        throw createHttpError.BadRequest(result);
    }
}
