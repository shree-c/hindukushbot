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
            // console.log(htmlToText(window.document.querySelectorAll(cssSel)[0].innerHTML))
            if (cssSel) {
                console.log('came here')
                let hold = window.document.querySelectorAll(cssSel);
                // // console.log(htmlToText(hold[0].innerHTML))
                resolve(hold)
            }
            else
                resolve(window.document)
        }).catch((err) => {
            reject(err);
        })
    })
}