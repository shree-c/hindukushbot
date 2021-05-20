const { htmlToText } = require('html-to-text');
const { genAxiosget } = require('./getart')
const monthArray = ["January", "Febuary", "March", "April", "May", "June", "July", "Auguest", "Sepetember", "October",
    "November", "December"];
const cssInfoObject = {
    info: {
        editorial: ".story-card h3 a",
        lead: ".story-card h3 a",
    },
    page: {
        editorial: '#artmeterinlinewrap ~ div',
        lead: '#artmeterinlinewrap ~ div',
    }

}
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
const arrayUpdatedTime = {
    editorial: null,
    lead: null,
}
const masterArrays = {
    lead: [],
    editorial: [],
}
const genUrl = "https://www.thehindu.com/opinion/";
function getTodaysArticlesInfo(section) {
    return new Promise((resolve, reject) => {
        console.log('called me info fun');
        genAxiosget(`${genUrl}${section}`, cssInfoObject.info.lead).then((value) => {
            console.log('genaxios inside')
            for (let card of value) {
                const hold = new MakeNeatObject(card.href, card.innerHTML, card.title);
                masterArrays[section].push(hold)
                arrayUpdatedTime[section] = (new Date()).getTime();
            }
            masterArrays[section] = masterArrays[section].sort((a, b) => {
                return a.date - b.date;
            });
            // console.log(masterArrays[section]);
            resolve(masterArrays[section])
        }).catch((err) => {
            console.log(err)
            reject(err);
        })
    })

}
// getTodaysArticlesInfo('editorial');
// getTodaysArticlesInfo('lead')
async function getTodaysArticlesInfoCached(section) {
    if (masterArrays[section].length && ((new Date()).getTime() - arrayUpdatedTime[section]) < 86400000) {
        console.log('cached return')
        return masterArrays[section];
    } else {
        console.log('normal call non cached')
        const hold = await getTodaysArticlesInfo(section)
        // console.log(hold)
        return hold;
    }
}
exports.realfilterfun = function (a) {
    const hol = (new Date().getTime()) - a.date.getTime();
    // console.log(hol)
    return (hol < 86400000);
}
exports.getArticleBody = function (which, filterfun) {
    return new Promise((resolve, reject) => {
        // console.log('frm get body function')
        getTodaysArticlesInfoCached(which).then(async (masterArray) => {
            if (filterfun) {
                // console.log('inside body filt if stat')
                const filteredARray = masterArray.filter(filterfun)
                console.log(filteredARray.length)
                const retArray = [];
                for (const obj of filteredARray) {
                    await genAxiosget(obj.link, cssInfoObject.page[which]).then((value) => {
                        // console.log(obj.link)
                        retArray.push(htmlToText(value[0].innerHTML, {wordwrap: null}))
                    }).catch((err) => {
                        if (err)
                            throw err;
                    })
                }
                console.log(`----${retArray.length}`)
                resolve(retArray)
                // genAxiosget(filteredARray[0].link, cssInfoObject.page[which]).then((value) => {
                //     const returnArray = [];
                //     for (const item of value) {
                //         // console.log(item.innerHTML)
                //         returnArray.push(htmlToText(item.innerHTML))
                //     }
                //     console.log(returnArray.length)
                //     resolve(returnArray);
                // }).catch((err) => {
                //     if (err)
                //         throw err
                // })
            }
        }).catch((err) => {
            reject(err)

        });
    })
}