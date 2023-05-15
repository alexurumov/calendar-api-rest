import { type ClassConstructor, plainToClass } from 'class-transformer';
import { type Request, type Response, type NextFunction } from 'express';
import { validateDto } from './validate-request.handler';

type ServiceMethod <T, U> = (params?: T) => Promise<U>;
export const handleRequestAndValidate = <T extends object, U>(
    DTOClass: ClassConstructor<T> | null,
    serviceMethod: ServiceMethod<T, U>,
    getData?: (req: Request) => Record<string, unknown>
) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            let response;
            if (DTOClass && getData) {
                const dto = plainToClass(DTOClass, getData(req));
                await validateDto(dto);
                response = await serviceMethod(dto);
            }
            response = await serviceMethod();
            return res.status(200).json(response);
        } catch (err: unknown) {
            next(err);
        }
    };
};
