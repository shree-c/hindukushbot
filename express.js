require('dotenv').config();
const express = require('express');
const { genSendmsg, getIdArray } = require('./getart');
const bot = require('./botinit');
const db = require('./db').db('telesend');
const { getbodycontents } = require('./index');
const app = express();
const pass = process.env.PASS;
const path = require('path');
const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: {service: 'express.js'},
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.File({ filename: 'express.js.log' })
    ],
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// send custom messages
app.post('/seCus', async (req, res) => {
    try {
        if (req.body.pass != pass)
            throw new Error('incorrect password');
        getIdArray(db.collection('ids')).then(async (value) => {
            await genSendmsg(value, bot, req.body.message);
            res.send('ok done!');
            logger.info(`sent custom message ${req.body.message}`);
        }).catch((err) => {
            res.send(err.message);
            logger.log(err.message);
        });
    } catch (err) {
        res.send(err.message);
        logger.error(err.message);
    }
});
app.post('/updates', async function (req, res) {
    try {
        if (req.body.pass != pass)
            throw new Error('incorrect password');
        getIdArray(db.collection('ids')).then((async (idarr) => {
            const ediarts = await getbodycontents('editorial');
            const leadarts = await getbodycontents('lead');
            for (const art of leadarts) {
                await genSendmsg(idarr, bot, art);
            }
            for (const edi of ediarts) {
                await genSendmsg(idarr, bot, edi);
            }
            logger.info('sent manual updates');
        })).catch((err) => {
            res.send(err.message);
            logger.error(err.message);
        });
    } catch (error) {
        res.send(error.message);
        logger.error(error.message);
    }
});
app.listen(3000, ()=>{
    logger.info('listining port 3000');
});
