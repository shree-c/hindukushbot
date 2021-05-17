const axios = require('axios')
const JSDOM = require('jsdom').JSDOM
const { htmlToText } = require('html-to-text');

exports.getFirart =  function (link) {
    axios.get(link).then((response)=>{
        const {window} = new JSDOM(response.data);
        console.log(htmlToText(window.document.querySelector('#artmeterinlinewrap').nextElementSibling.innerHTML))
    }).catch((err)=>{
        console.log(err)
    });
}