import express, {Request, Response} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import {customExpress as expressConfig} from "./src/config/express";
import {database as databaseConfig} from "./src/config/database";

const apiRouter = require('./src/router');

dotenv.config();
const PORT: string = process.env.PORT as string;

(async function start() {
    const app = express();
    // Connect the DB
    await databaseConfig();

    // Configure Express specs
    expressConfig(app);

    // Configure Cors
    app.use(cors());

    app.get('/', (req: Request, res: Response) => {
        res.json({message: 'It works!'})
    })

    // Configure Router
    app.use('/api/', apiRouter);

    app.listen(PORT, () => console.log(`>>> Application started at http://localhost:${PORT}`));
})();