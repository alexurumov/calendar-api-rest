import { type NextFunction, type Request, type Response } from 'express';
import { HttpError } from 'http-errors';

export function handleErrors (err: Error, req: Request, res: Response, next: NextFunction): Response | void {
    if (err) {
        console.error(err);

        if (err instanceof HttpError) {
            return res.status(err.status).json({ message: err.message.trim() });
        }
        return res.status(500).json({ message: 'Oops! Something happened...' });
    }
    next();
}
