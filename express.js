require('dotenv').config();
const express = require('express');
const { genSendmsg, getIdArray } = require('./getart')
const bot = require('./botinit');
const db = require('./db').db('telesend')
const { getbodycontents } = require('./index')
const app = express();
const pass = process.env.PASS
const path = require('path');
const { RSA_NO_PADDING } = require('constants');
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));
app.post('/seCus', async (req, res) => {
    try {
        if (req.body.pass != pass)
            throw new Error('incorrect password')
        getIdArray(db.collection('ids')).then(async (value) => {
            await genSendmsg(value, bot, req.body.message)
            res.send('ok happening now')
        }).catch((err) => {
            res.send(err.message)
            console.log(err)
        });
    } catch (err) {
        res.send(err.message);
        console.log(err)
    }
});
app.post('/updates', async function (req, res) {
    try {
        if (req.body.pass != pass)
            throw new Error('incorrect password')
        getIdArray(db.collection('ids')).then((async (idarr) => {
            const ediarts = await getbodycontents('editorial')
            const leadarts = await getbodycontents('lead')
            for (const art of leadarts) {
                await genSendmsg(idarr, bot, art)
            }
            for (const edi of ediarts) {
                await genSendmsg(idarr, bot, edi)
            }
            res.send('ok sent')
        })).catch((err) => {
            res.send(err.message)
            console.log(err)
        })
    } catch (error) {
        res.send(error.message)
        console.log(error.message)
    }
})
app.listen(3000)
