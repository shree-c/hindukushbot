const axios = require('axios').default;
const jsdom = require("jsdom");
const { htmlToText } = require('html-to-text');
const { JSDOM } = jsdom;
const { getFirart } = require('./getart')
const monthArray = ["January", "Febuary", "March", "April", "May", "June", "July", "Auguest", "Sepetember", "October",
    "November", "December"];
class MakeNeatObject {
    constructor(link, name, dateStr) {
        this.link = link;
        this.name = name;
        this.date = new Date(...(MakeNeatObject.getDateStrInArray(dateStr)));
    }
    static getDateStrInArray(dspar) {
        dspar = dspar.split('Published')[1].split(' ');
        return [+dspar[3], monthArray.indexOf(dspar[1]), +(dspar[2].split(',')[0]), dspar[4].split(":")[0], dspar[4].split(":")[1]];
    }
}




axios.get("https://www.thehindu.com/opinion/lead/").then(function (response) {
    const { window } = new JSDOM(response.data);
    const topShowcase = window.document.querySelectorAll(".story-card-heading")
    const bottomHidden = window.document.querySelectorAll(".Other-StoryCard-heading");
    const masterLeadArray = [];
    for (let card of topShowcase) {
        const finalEle = card.nextElementSibling.childNodes[1];
        masterLeadArray.push(new MakeNeatObject(finalEle.href, finalEle.innerHTML, finalEle.title));
    }
    for (let card of bottomHidden) {
        masterLeadArray.push(new MakeNeatObject(card.href, card.innerHTML, card.title))
    }
    getFirart(masterLeadArray[0].link)
}).catch(function (error) {
    console.log(error);
});


function genAxiosget(url, cssSel) {
    axios.get(url).then((response)=>{
        const {window} = new JSDOM(response.data);
        return window.document.querySelectorAll(cssSel)
    }).catch((err)=>{
        console.log(err)
    })
}
