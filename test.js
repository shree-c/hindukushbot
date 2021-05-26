const Agenda = require('agenda');


const dbURL = 'mongodb://127.0.0.1:27017/AgendaMedium';
const agenda = new Agenda({
    db: { address: dbURL, collection: 'Agenda', useUnifiedTopology: true },
    processEvery: '20 seconds',
});

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
// class Hope {
//     constructor(name) {
//         this.name = name;
//     }
//     log() {
//         console.log(this.name)
//     }
// }
// const hold = new Hope("all is well");
// console.log(JSON.stringify(hold.__proto__))
// hold.log();