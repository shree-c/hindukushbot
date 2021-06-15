require('dotenv').config();
const client = require('./db');
const db = client.db('telesend')
const bot = require('./botinit')
const express = require('./express')
const { initialise, getbodycontents } = require('./index.js');
(async function(){
    console.log('initialising...')
    await initialise();
})();

const schedule = require('node-schedule');
//rule to send updates at 12 am
//no time-zone set
const rule = new schedule.RecurrenceRule();
rule.hour = 5;
rule.minute = 0;
rule.second = 0;
const job = schedule.scheduleJob(rule, async () => {
    //fetching chatids from db
    const chatids = await db.collection('ids').find({})
    await chatids.forEach(async (obj) => {
        console.log(obj)
        getbodycontents('lead')
            .then(async (value) => {
                for (const bobj of value) {
                    for (const sobj of bobj) {
                        await ctx.reply(sobj)
                    }
                }
            })
            .then((value) => {
                getbodycontents('editorial')
                    .then(async (value) => {
                        for (const bobj of value) {
                            for (const sobj of bobj) {
                                await ctx.reply(sobj);
                            }
                        }
                    })
            })
            .catch(async (err) => {
                await ctx.reply('We have got some problems going on. We will correct them as soon as possible. Sorry for inconvinence.')
                console.log(err);
            })
    })
})
//manual commands 'start', 'stop', 'gettodayslead', 'gettodayseditorials'
bot.command('gettodayslead', (ctx) => {
    console.log('from getlead')
    getbodycontents('lead').then(async (value) => {
        for (const bobj of value) {
            for (const sobj of bobj) {
                await ctx.reply(sobj)
            }
        }
    }).catch(async (err) => {
        await ctx.reply('We have got some problems going on. We will correct them as soon as possible. Sorry for inconvinence.')
        console.log(err);
    })
})
bot.command('gettodayseditorials', (ctx) => {
    console.log('from getedi')
    getbodycontents('editorial').then(async (value) => {
        for (const bobj of value) {
            for (const sobj of bobj) {
                await ctx.reply(sobj);
            }
        }
        console.log('sent it')
        console.log(ctx.from)
    }).catch(async (err) => {
        await ctx.reply('We have got some problems going on. We will correct them as soon as possible. Sorry for inconvinence.')
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
        await ctx.reply('We have got some problems going on. We will correct them as soon as possible. Sorry for inconvinence.')
        console.log(err)
    }
})
bot.command('stop', async (ctx) => {
    await db.collection('ids').deleteOne({ id: ctx.chat.id })
    ctx.reply('ok removed!')
});
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.launch();
