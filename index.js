const axios = require('axios').default;
//const express = require('express');
const jsdom = require("jsdom");
const { htmlToText } = require('html-to-text');
const { JSDOM } = jsdom;
const monthArray = ["January", "Febuary", "March", "April", "May", "June", "July", "Auguest", "Sepetember", "October",
"November", "December"];
class MakeNeatObject {
    constructor(link, name, dateStr) {
        this.link = link;
        this.name = name;
        // MakeNeatObject.getDateStrInArray(dateStr);
        this.date = new Date(...(MakeNeatObject.getDateStrInArray(dateStr)));
    }
    static getDateStrInArray (dspar) {
        // console.log(dspar)
        // console.log(typeof dspar)
        // console.log(dspar.split('Published')[1].split(' '));
        dspar = dspar.split('Published')[1].split(' ');
        // let hol = [+dspar[3], monthArray.indexOf(dspar[1]) , +(dspar[2].split(',')[0]), dspar[4].split(":")[0], dspar[4].split(":")[1]];
        return [+dspar[3], monthArray.indexOf(dspar[1]) , +(dspar[2].split(',')[0]), dspar[4].split(":")[0], dspar[4].split(":")[1]];
    }
}
axios.get("https://www.thehindu.com/opinion/lead/").then(function(response) {
    // console.log(response);
    const { window } = new JSDOM(response.data);
    const topShowcase =  window.document.querySelectorAll(".story-card-heading")
    const bottomHidden = window.document.querySelectorAll(".Other-StoryCard-heading");
    const masterLeadArray = [];
        for (let card of topShowcase) {
            const finalEle = card.nextElementSibling.childNodes[1];
            // masterLeadArray.push({
            //     date : finalEle.title,
            //     name: finalEle.innerHTML,
            //     link: finalEle.href
            // })
            masterLeadArray.push(new MakeNeatObject(finalEle.href, finalEle.innerHTML, finalEle.title));
            // console.log(`published date: ${finalEle.title}
            // Article name: ${finalEle.innerHTML}`);
        }
        for (let card of bottomHidden) {
            // masterLeadArray.push({
            //     date: card.title,
            //     name: card.innerHTML,
            //     link: card.href
            // })
            masterLeadArray.push(new MakeNeatObject(card.href, card.innerHTML, card.title))
        }
        console.log(masterLeadArray)

}).catch(function(error) {
    console.log(error);
});

