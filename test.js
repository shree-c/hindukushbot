// const {getArticleBody, fun, realfilterfun} = require('./index.js')
// const {cachedfun} = require('./app')
// fun('lead').then((value)=>{
//     console.log(value)
// })

// cachedfun('lead').then((value)=>{
//     console.log(value)
// })
// getArticleBody('editorial', realfilterfun).then((value)=>{
//     console.log(value)
// })

const nin = require('./nindex');
(async function () {
    // await nin.getTodaysArticlesInfo('lead')
    // console.log(nin.arr);
    nin.initialise().then(() => {
        nin.getbodycontents('lead').then((value) => {
            console.log(value)
        }).catch((err) => {
            console.log(err)
        })

    })
})()
// const schedule = require('node-schedule')
// const rule = new schedule.RecurrenceRule();
// rule.hour = 22;
// rule.minute = [41, 43]
// rule.second = [2, 3, 4, 4]
// const job = schedule.scheduleJob(rule, function(){
//     console.log('A new day has begun in the UTC timezone!');
//   });
