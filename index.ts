import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import { databaseConfig, expressConfig } from './src/config/';
import { routes } from './src/router';

dotenv.config();
const PORT: string = process.env.PORT as string || '5555';

void (async function start () {
    const app = express();
    // Connect the DB
    await databaseConfig();

    // Configure Express specs
    expressConfig(app);

    app.get('/', (req: Request, res: Response) => {
        res.json({ message: 'It works! Please, use /api suffix to access data further!' });
    });

    // Configure Router
    app.use('/api/', routes);

    app.listen(PORT, () => { console.log(`>>> Application started at http://localhost:${PORT}`); });
})();
