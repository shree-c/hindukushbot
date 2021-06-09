const { MongoClient } = require('mongodb')
const dbURL = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
(async function () {
    try {
        await client.connect();
        console.log('connected to db');
    } catch(err) {
        console.log(err);
    }
})();
module.exports = client;