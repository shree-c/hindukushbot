const axios = require('axios');
const JSDOM = require('jsdom').JSDOM;
const { htmlToText } = require('html-to-text');
const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: {service: 'genartfuns'},
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.File({ filename: 'getart.js.log' })
    ],
});
exports.getFirart = function (link) {
    axios.get(link).then((response) => {
        const { window } = new JSDOM(response.data);
        console.log(htmlToText(window.document.querySelector('#artmeterinlinewrap').nextElementSibling.innerHTML));
    }).catch((err) => {
        console.log(err);
    });
};
//this is the function which gets the required dom element from the required url
exports.genAxiosget = function (url, cssSel) {
    return new Promise((resolve, reject) => {
        axios.get(url).then((response) => {
            const { window } = new JSDOM(response.data);
            if (cssSel) {
                let hold = window.document.querySelectorAll(cssSel);
                resolve(hold);
            }
            else
                resolve(window.document);
        }).catch((err) => {
            reject(err);
        });
    });
};
//general function to send messages based on given id array
exports.genSendmsg = async function (arr, bot, message) {
    if (!Array.isArray(arr))
        throw new Error('the first argument should be of Array type');
    if (!arr.length)
        throw new Error('chat id array is empty');
    if (!message)
        throw new Error('empty message');
    for (const id of arr) {
        if (Array.isArray(message)) {
            for (const str of message) {
                try {
                await bot.telegram.sendMessage(id, str);
                } catch (err) {
                    logger.log(err.message);
                }
            }
        } else {
         try {
            await bot.telegram.sendMessage(id, message.trim());
            } catch (err) {
                logger.log(err.message)
            }

        }
    }
    return arr.length;
};
//general function to fetch ids
exports.getIdArray = async function (collection) {
    const arr = await collection.find({});
    const pureIdsArr = [];
    await arr.forEach((value) => {
        pureIdsArr.push(value.id);
    });
    if (!pureIdsArr.length)
        throw new Error('empty id array');
    return pureIdsArr;
};
