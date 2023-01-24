import {IUser} from "../entities/User.model";

declare global {
    namespace Express {
        export interface Request {
            user?: {
                _id: string
            }
        }
    }
}

export default {};