import {IUser} from "../models/User";

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