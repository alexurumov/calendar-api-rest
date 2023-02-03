import { type NextFunction, type Request, type Response } from 'express';

export const validateContentType = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    if (req.is('application/json')) {
        next();
    } else {
        res.json({ message: 'Only JSON accepted!' });
    }
};
