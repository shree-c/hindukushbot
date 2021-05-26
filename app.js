require('dotenv').config();
const { Telegraf } = require('telegraf');
const { getArticleBody, realfilterfun } = require('./index');
const breakStr = require('./brkstrfun');
const apikey = process.env.TELE_KEY;
const bot = new Telegraf(apikey);
const Agenda = require('agenda');
const dbURL = 'mongodb://127.0.0.1:27017/AgendaMedium';
const agenda = new Agenda({
    db: { address: dbURL, collection: 'Agenda', useUnifiedTopology: true },
    processEvery: '20 seconds',
});
// agenda.define('send daily updates', async (job) => {
//     try {
//         const lhold = await getCachedArticleBody('lead');
//         for (const bobj of hold) {
//             for (const sobj of bobj) {
//                 await bot.telegram.sendMessage(sobj);
//             }
//         }
//         const ehold = await getCachedArticleBody('editorial');
//         for (const bobj of value) {
//             for (const sobj of bobj) {
//                 await bot.telegram.sendMessage(sobj);
//             }
//         }
//     } catch (err) {
//         console.log(err);
//     }
// })
//     (async function () { // IIFE to give access to async/await
//         await agenda.start();

//         await agenda.every('in 2 seconds', 'send daily updates');

//         // Alternatively, you could also do:
//         // await agenda.every('*/3 * * * *', 'delete old users');
//     })();

bot.command('gettodayslead', (ctx) => {
    getCachedArticleBody('lead').then(async (value) => {
        for (const bobj of value) {
            for (const sobj of bobj) {
                await ctx.reply(sobj)
            }
        }
        // console.log('sent it')
        // console.log(ctx.from)
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
bot.command('start', (ctx) => {
    ctx.reply(`Hey,
    this hindukush bot.
    I can give you todays lead and editorial articles from the hindu.
    gettodayseditorials and gettodayslead are respective commands.
    try typing /`)
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