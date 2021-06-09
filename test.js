const { MongoClient } = require('mongodb')
const dbURL = 'mongodb://127.0.0.1:27017';
const Agenda = require('agenda');
const { Telegraf } = require('telegraf');
require('dotenv').config();
const client = new MongoClient(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
(async function () {
    await client.connect();
})();
const db = client.db('fortes');
(async function () {
    console.log('hello wold======')
    const hold = await db.collection('messageids').find({})
    hold.forEach((item)=>{
        console.log(item);
    })
})();
const bot = new Telegraf(process.env.TELE_KEY);
bot.command('start', async (ctx) => {
    try {
        // console.log(JSON.stringify(ctx));
        await ctx.reply("hello world")
        if (!await db.collection('messageids').findOne({id: ctx.chat.id})) {
            await db.collection('messageids').insertOne({ id: ctx.chat.id })
        }
        // console.log(hold)
    } catch (err) {
        console.log(err)
    }
})
bot.command('sendtoall', async (ctx)=>{
    const hold = await db.collection('messageids').find({});
    console.log('ok')
    hold.forEach((item)=>{
        console.log(item)
        bot.telegram.sendMessage(item.id, "ok baby");
    })
})
const agenda = new Agenda({ mongo: db, processEvery: '20 seconds' });

// const agenda = new Agenda({
//     db: { address: dbURL, collection: 'Agenda', useUnifiedTopology: true },
//     processEvery: '20 seconds',
// });

// console.log(Object.getOwnPropertyNames(Agenda.prototype))
agenda.define('log hello medium', async job => {
    const { name } = job.attrs;

    console.log(`Hello ${name} 👋`);

    /**
     * Replace the dummy log and write your code here
     */
});
(async function () {
    await agenda.start(); // Start Agenda instance

    await agenda.schedule('in 10 seconds', 'log hello medium', { name: 'Medium' }); // Run the dummy job in 10 minutes and passing data.
})();

bot.launch();