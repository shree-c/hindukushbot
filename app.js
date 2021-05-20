require('dotenv').config();
const { Telegraf } = require('telegraf');
const { getArticleBody, realfilterfun } = require('./index');
const breakStr = require('./brkstrfun');
const apikey = process.env.TELE_KEY;
const bot = new Telegraf(apikey);
bot.command('gettodayslead', (ctx) => {
    getCachedArticleBody('lead').then((value) => {
        for (let bobj of value) {
            for (let sobj of bobj) {
                bot.telegram.sendMessage(ctx.chat.id, sobj);
            }
        }
        console.log('sent it')
        console.log(ctx.from)
    }).catch((err) => {
        console.log(err);
    })
})
function getCachedArticleBody(section) {
    return new Promise((resolve, reject) => {
        if (getCachedArticleBody.updatedTime && ((new Date()).getTime() - getCachedArticleBody.updatedTime < 86400000)) {
            console.log('cached body return');
            resolve(getCachedArticleBody.brokenArray[section]);
        } else {
            getArticleBody(section, realfilterfun).then((value) => {
                getCachedArticleBody.brokenArray[section] = breakStr(value, 4000);
                getCachedArticleBody.updatedTime[section] = (new Date()).getTime();
                console.log(getCachedArticleBody.brokenArray[section])
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

bot.command('gettodayseditorials', (ctx) => {
    getCachedArticleBody('editorial').then((value) => {
        for (let bobj of value) {
            for (let sobj of bobj) {
                bot.telegram.sendMessage(ctx.chat.id, sobj);
            }
        }
        console.log('sent it')
        console.log(ctx.from)
    }).catch((err) => {
        console.log(err);
    })
})

bot.launch();