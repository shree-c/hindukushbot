const client = require('./db');
const db = client.db('telesend');
const bot = require('./botinit');
const { getbodycontents, getTodaysArticlesInfo } = require('./index.js');
const winston = require('winston');
const schedule = require('node-schedule');
const { genSendmsg, getIdArray } = require('./getart');
require('./express');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: {service: 'app.js'},
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.File({ filename: 'app.js.log' })
    ],
});
//initialisation funciton
async function initialise () {
    const leadarr = await getTodaysArticlesInfo('lead');
    const ediarr = await getTodaysArticlesInfo('editorial');
    return [leadarr, ediarr];
}
(async function(){
    try {
        const hold = await initialise();
        logger.info('initialised data');
        for (const section of hold) {
            for (const item of section) {
                logger.info(`${item.name} ${item.ldate}---${item.section}`);
            }
        }
    } catch(err) {
        logger.error(err.message);
    }
})();

//this is for initialising to keep the data fresh
const inforule = new schedule.RecurrenceRule();
inforule.hour = [new schedule.Range(0, 6)];
inforule.minute = [0, 30];
inforule.second = 0;
schedule.scheduleJob(inforule, async function () {
    try {
        await getTodaysArticlesInfo('lead').then((value)=>{
            for (const item of value) {
                logger.info(`${item.name} ${item.ldate}---${item.section}`);
            }
        });
        await getTodaysArticlesInfo('editorial').then((value)=>{
            for (const item of value) {
                logger.info(`${item.name} ${item.ldate}---${item.section}`);
            }
        });
    } catch (err) {
        logger.error(err);
    }
});
//rule to send updates at 12 am
//no time-zone set
const rule = new schedule.RecurrenceRule();
rule.hour = 5;
rule.minute = 50;
rule.second = 0;
schedule.scheduleJob(rule, async () => {
    //fetching chatids from db
    try {
        getIdArray(db.collection('ids')).then((async (idarr) => {
            const ediarts = await getbodycontents('editorial');
            const leadarts = await getbodycontents('lead');
            for (const art of leadarts) {
                await genSendmsg(idarr, bot, art);
            }
            for (const edi of ediarts) {
                await genSendmsg(idarr, bot, edi);
            }
        }));
        logger.info(`sent daily updates ${ new Date().toISOString()}`);
    } catch(err) {
        logger.log(err);
    }
});
//manual commands 'start', 'stop', 'gettodayslead', 'gettodayseditorials'
bot.command('gettodayslead', (ctx) => {
    getbodycontents('lead').then(async (value) => {
        for (const bobj of value) {
            for (const sobj of bobj) {
                await ctx.reply(sobj);
            }
        }
        logger.info(`sent lead to ${ctx.chat.username || ctx.chat.first_name}`);
    }).catch(async (err) => {
        await ctx.reply('We have got some problems going on. We will correct them as soon as possible. Sorry for inconvinence.');
        logger.err(err.message);
    });
});
bot.command('gettodayseditorials', (ctx) => {
    getbodycontents('editorial').then(async (value) => {
        for (const bobj of value) {
            for (const sobj of bobj) {
                await ctx.reply(sobj);
            }
        }
        logger.info(`sent lead to ${ctx.chat.username | ctx.chat.first_name}`);
    }).catch(async (err) => {
        await ctx.reply('We have got some problems going on. We will correct them as soon as possible. Sorry for inconvinence.');
        logger.error(err.message);
    });
});
bot.command('start', async (ctx) => {
    try {
        await ctx.reply(`Hey,
    this hindukush bot.
    I can give you todays lead and editorial articles from the hindu.
    gettodayseditorials and gettodayslead are respective commands.
    try typing /`);
        //checking if id already exists
        const item = await db.collection('ids').findOne({ id: ctx.chat.id });
        if (!item) {
            await db.collection('ids').insertOne({ id: ctx.chat.id, username: ctx.chat.username, firstname: ctx.chat.first_name, lastname: ctx.chat.last_name});
            logger.info('Added new user to db');
        }
        else {
            ctx.reply('you are already regestered');
        }

    } catch (err) {
        await ctx.reply('We have got some problems going on. We will correct them as soon as possible. Sorry for inconvinence.');
        logger.message(err.message);
    }
});
bot.command('stop', async (ctx) => {
    await db.collection('ids').deleteOne({ id: ctx.chat.id });
    ctx.reply('ok removed!');
});
bot.on('sticker', (ctx) => ctx.reply('👍'));
bot.launch();
// graceful stopping
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
process.on('uncaughtException', function (exception) {
    logger.error(exception);
});
