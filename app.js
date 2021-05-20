const { Telegraf } = require('telegraf');
const { getArticleBody, realfilterfun } = require('./index');
const breakStr = require('./brkstrfun');
// var _ = require('lodash');
const bot = new Telegraf('1864443655:AAHljGe3zrgq796EsCF6QMzUUP9W9OW0L4E');
function smallArrayTurner(arr) {
    console.log(arr)
    const retArr = [];
    for (const obj of arr) {
        retArr.push(_.chunk(obj, 4000))
    }
    return retArr;
}
// getArticleBody('lead', realfilterfun).then((value)=>{
//     console.log(value.length)
//     let hold = breakStr(value, 4000)
//     for (const obj of hold) {
//         console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>${obj.length}`)
//         for (const sobj of obj) {
//             console.log("\n*************************************\n")

//         }
//     }
// }).catch((err)=>{
//     console.log(err)
// })
bot.command('gettodayslead', (ctx) => {
    getArticleBody('lead', realfilterfun).then((value) => {
        const hold = breakStr(value, 4000);
        for (let bobj of hold) {
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
bot.command('gettodayseditorials', (ctx) => {
    getArticleBody('lead', realfilterfun).then((value) => {
        const hold = breakStr(value, 4000);
        for (let bobj of hold) {
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
// bot.command('start', ctx => {
//     console.log(ctx.from)
//     bot.telegram.sendMessage(ctx.chat.id, 'hello there! Welcome to my new telegram bot.', {
//     })
// })
bot.launch();