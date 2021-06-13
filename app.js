require('dotenv').config();
const client = require('./db');
const db = client.db('telesend')
const { Telegraf } = require('telegraf');
const { getArticleBody, realfilterfun } = require('./index');
const breakStr = require('./brkstrfun');
const bot = new Telegraf('1864443655:AAHljGe3zrgq796EsCF6QMzUUP9W9OW0L4E');
const schedule = require('node-schedule');
//rule to send updates at 12 am
//no time-zone set
const rule = new schedule.RecurrenceRule();
rule.hour = 0; 
rule.minute = 10;
rule.second = 10;
const job = schedule.scheduleJob(rule, async () => {
    try {
        //fetching chatids from db
        const chatids = await db.collection('ids').find({})
        await chatids.forEach(async (obj) => {
            console.log(obj)
            await bot.telegram.sendMessage(obj.id, 'hello world')
            let value = await getCachedArticleBody('lead')
            for (const bobj of value) {
                for (const sobj of bobj) {
                    await bot.telegram.sendMessage(obj.id, sobj)
                }
            }
            value = await getCachedArticleBody('editorial')
            for (const bobj of value) {
                for (const sobj of bobj) {
                    await bot.telegram.sendMessage(obj.id, sobj)
                }
            }
        })
    } catch(err) {
        console.log(err)
    }
})
//manual commands 'start', 'stop', 'gettodayslead', 'gettodayseditorials'
bot.command('gettodayslead', (ctx) => {
    getCachedArticleBody('lead').then(async (value) => {
        for (const bobj of value) {
            for (const sobj of bobj) {
                await ctx.reply(sobj)
            }
        }
    }).catch((err) => {
        console.log(err);
    })
})
bot.command('gettodayseditorials', (ctx) => {
    getCachedArticleBody('editorial').then(async (value) => {
        for (const bobj of value) {
            for (const sobj of bobj) {
                await ctx.reply(sobj);
            }
        }
        console.log('sent it')
        console.log(ctx.from)
    }).catch((err) => {
        console.log(err);
    })
})
bot.command('start', async (ctx) => {
    try {
        await ctx.reply(`Hey,
    this hindukush bot.
    I can give you todays lead and editorial articles from the hindu.
    gettodayseditorials and gettodayslead are respective commands.
    try typing /`);
        //checking if id already exists
        const item = await db.collection('ids').findOne({ id: ctx.chat.id })
        if (!item)
            await db.collection('ids').insertOne({ id: ctx.chat.id });
        else {
            console.log('id exist')
            ctx.reply('you are already regestered')
        }

    } catch (err) {
        console.log(err)
    }
})
bot.command('stop', async (ctx) => {
    await db.collection('ids').deleteOne({ id: ctx.chat.id })
    ctx.reply('ok removed!')
})
//this is general function for both editorials and leads section
//it refreshes storage array content if it is more than 24 hours old or gets new content in case of stale
//content and returns the required array in both case
function getCachedArticleBody(section) {
    return new Promise((resolve, reject) => {
        if (getCachedArticleBody.updatedTime[section] && ((new Date()).getTime() - getCachedArticleBody.updatedTime[section] < 86400000)) {
            console.log('cached return...')
            resolve(getCachedArticleBody.brokenArray[section]);
        } else {
            //we get the new array content and also update the update-arrays with current time
            getArticleBody(section, realfilterfun).then((value) => {
                //we are already breaking strings here
                const hold = breakStr(value, 4000);
                getCachedArticleBody.brokenArray[section] = hold;
                getCachedArticleBody.updatedTime[section] = (new Date()).getTime();
                console.log('non cached body return');
                resolve(getCachedArticleBody.brokenArray[section]);
            }).catch((err) => {
                if (err)
                    reject(err)
            })
        }
    })
}
//these arrays are used to temperorily store articles and update time
//broken and formatted strings
getCachedArticleBody.brokenArray = {
    lead: null,
    editorial: null,
};
getCachedArticleBody.updatedTime = {
    lead: null,
    editorial: null,
}
bot.launch();
