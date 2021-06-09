require('dotenv').config();
const client = require('./db');
const db = client.db('telesend')
const { Telegraf } = require('telegraf');
const { getArticleBody, realfilterfun } = require('./index');
const breakStr = require('./brkstrfun');
const apikey = process.env.TELE_KEY;
const bot = new Telegraf(apikey);

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
        await db.collection('ids').insertOne({ id: ctx.chat.id });
    } catch (err) {
        console.log(err)
    }
})

function getCachedArticleBody(section) {
    return new Promise((resolve, reject) => {
        // console.log(getCachedArticleBody.updatedTime[section])
        if (getCachedArticleBody.updatedTime[section] && ((new Date()).getTime() - getCachedArticleBody.updatedTime[section] < 86400000)) {
            // console.log('cached body return');
            resolve(getCachedArticleBody.brokenArray[section]);
        } else {
            getArticleBody(section, realfilterfun).then((value) => {
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
getCachedArticleBody.brokenArray = {
    lead: null,
    editorial: null,
};
getCachedArticleBody.updatedTime = {
    lead: null,
    editorial: null,
}
bot.launch();