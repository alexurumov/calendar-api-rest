declare global {
    namespace Express {
        export interface Request {
            user?: {
                _id: string
                username: string
            }
        }
    }
}

export default {};
