const axios = require('axios').default;
const jsdom = require("jsdom");
const { htmlToText } = require('html-to-text');
const { JSDOM } = jsdom;
const { getFirart, genAxiosget } = require('./getart')
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



const masterLeadArray = [];

axios.get("https://www.thehindu.com/opinion/lead/").then(async function (response) {
    const { window } = new JSDOM(response.data);
    const topShowcase = window.document.querySelectorAll(".story-card-heading")
    const bottomHidden = window.document.querySelectorAll(".Other-StoryCard-heading");
    for (let card of topShowcase) {
        const finalEle = card.nextElementSibling.childNodes[1];
        masterLeadArray.push(new MakeNeatObject(finalEle.href, finalEle.innerHTML, finalEle.title));
    }
    for (let card of bottomHidden) {
        masterLeadArray.push(new MakeNeatObject(card.href, card.innerHTML, card.title))
    }
}).catch(function (error) {
    console.log(error);
}).then(async ()=>{
    const artObj = genAxiosget(masterLeadArray[2].link, "#artmeterinlinewrap ~ div");
    artObj.then((value)=>{
        console.log(htmlToText(value[0].innerHTML));
    }).catch((err)=>{
        console.log(err);
    })
});



