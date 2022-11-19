const express = require('express');
const { databaseConfig, expressConfig } = require('./config');
const cors = require('cors');
const apiRouter = require('./router');
require('dotenv').config();
const PORT  = process.env.PORT || 5555; 

start();

async function start() {
    const app = express();
    // Connect the DB
    await databaseConfig(app);

    // Configure Express specs
    expressConfig(app);

    // Configure Cors
    app.use(cors());

    app.get('/', (req, res) => {
        res.json({message: 'It works!'})
    })

    // Configure Router
    app.use('/api/', apiRouter);

    app.listen(PORT, () => console.log(`>>> Application started at http://localhost:${PORT}`));
}

