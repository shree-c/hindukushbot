const axios = require('axios')
const JSDOM = require('jsdom').JSDOM
const { htmlToText } = require('html-to-text');

exports.getFirart = function (link) {
    axios.get(link).then((response) => {
        const { window } = new JSDOM(response.data);
        console.log(htmlToText(window.document.querySelector('#artmeterinlinewrap').nextElementSibling.innerHTML))
    }).catch((err) => {
        console.log(err)
    });
}
exports.genAxiosget = function (url, cssSel) {
    return new Promise((resolve, reject)=>{
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
        })
    })
}
// exports.ges = function (url, cssSel) {

// }