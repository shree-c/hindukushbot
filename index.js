const { htmlToText } = require('html-to-text');
const { genAxiosget } = require('./getart')
const monthArray = ["January", "Febuary", "March", "April", "May", "June", "July", "Auguest", "Sepetember", "October",
    "November", "December"];
//this is the universal object for css related data sotrage
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
//this is the class to make info objects which contain link heading and date of that article 
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
//info update time array
const arrayUpdatedTime = {
    editorial: null,
    lead: null,
}
//this is for holding info object sorted based on date
const masterArrays = {
    lead: [],
    editorial: [],
}
const genUrl = "https://www.thehindu.com/opinion/";
//this function gets the links of all articles the latest ones
function getTodaysArticlesInfo(section) {
    return new Promise((resolve, reject) => {
        genAxiosget(`${genUrl}${section}`, cssInfoObject.info.lead).then((value) => {
            for (let card of value) {
                const hold = new MakeNeatObject(card.href, card.innerHTML, card.title);
                masterArrays[section].push(hold)
                arrayUpdatedTime[section] = (new Date()).getTime();
            }
            masterArrays[section] = masterArrays[section].sort((a, b) => {
                return a.date - b.date;
            });
            resolve(masterArrays[section])
        }).catch((err) => {
            reject(err);
        })
    })
}
//function for getting article info casched vertion which refreshes cache every 24hours
async function getTodaysArticlesInfoCached(section) {
    if (masterArrays[section].length && ((new Date()).getTime() - arrayUpdatedTime[section]) < 86400000) {
        return masterArrays[section];
    } else {
        const hold = await getTodaysArticlesInfo(section)
        return hold;
    }
}
//general function to add head and tail to any string
function addHeadandTail(heading, string, footer) {
    heading = heading + '\n';
    string = string.padStart((heading.length + string.length), heading)
    return string.padEnd((string.length + footer.length), footer);
}
//filter function for returning objects
exports.realfilterfun = function (a) {
    const hol = (new Date().getTime()) - a.date.getTime();
    console.log(`${new Date()}-----${a.date}`)
    return (hol < (1 * 86400000));
}
//gets the article body based on links in article info array it also uses filter function to filter results
//resolves with neatly formatted articles
exports.getArticleBody = function (which, filterfun) {
    return new Promise((resolve, reject) => {
        getTodaysArticlesInfoCached(which).then(async (masterArray) => {
            if (filterfun) {
                const filteredARray = masterArray.filter(filterfun)
                if (filteredARray.length) {
                    console.log(`filtered array form article body\n${filteredARray.length}`)
                    const retArray = [];
                    for (const obj of filteredARray) {
                        await genAxiosget(obj.link, cssInfoObject.page[which]).then((value) => {
                            const hold = addHeadandTail(`[********HEADING**********]${obj.name}\n[*********HEADING*********]\n`, htmlToText(value[0].innerHTML, { wordwrap: null }), `\n*******ARTICLE END*******\n`);
                            retArray.push(hold);
                        }).catch((err) => {
                            if (err)
                                throw err;
                        })
                    }
                    resolve(retArray)
                } else {
                    const retArray = [`there are no ${which} published in last 24 hours`];
                    // for (const obj of masterArray) {
                    //     await genAxiosget(obj.link, cssInfoObject.page[which]).then((value) => {
                    //         const hold = addHeadandTail(`[********HEADING**********]${obj.name}\n[*********HEADING*********]\n`, htmlToText(value[0].innerHTML, { wordwrap: null }), `\n*******ARTICLE END*******\n`);
                    //         retArray.push(hold);
                    //     }).catch((err) => {
                    //         if (err)
                    //             throw err;
                    //     })
                    // }
                    console.log(`filtered array empty so without filter fun returned array len----${retArray.length}`)
                    resolve(retArray)
                }
            } else {
                throw new Error('nothing to in last 24 hours')
            }
        }).catch((err) => {
            reject(err)
        });
    })
}