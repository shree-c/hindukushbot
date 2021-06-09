const schedule = require('node-schedule')
const rule = new schedule.RecurrenceRule();
rule.hour = 0
rule.minute = 10;
rule.second = 0;
const job = schedule.scheduleJob(rule, ()=>{
    console.log('hello world')
})