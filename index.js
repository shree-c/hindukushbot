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
function addHead(heading, string, footer) {
    heading = heading + '\n';
    string =  string.padStart((heading.length + string.length), heading)
    return string.padEnd((string.length + footer.length), footer);
}
async function getTodaysArticlesInfoCached(section) {
    if (masterArrays[section].length && ((new Date()).getTime() - arrayUpdatedTime[section]) < 86400000) {
        return masterArrays[section];
    } else {
        const hold = await getTodaysArticlesInfo(section)
        return hold;
    }
}
exports.realfilterfun = function (a) {
    const hol = (new Date().getTime()) - a.date.getTime();
    return (hol < 86400000);
}
exports.getArticleBody = function (which, filterfun) {
    return new Promise((resolve, reject) => {
        getTodaysArticlesInfoCached(which).then(async (masterArray) => {
            if (filterfun) {
                const filteredARray = masterArray.filter(filterfun)
                console.log(filteredARray.length)
                const retArray = [];
                for (const obj of filteredARray) {
                    await genAxiosget(obj.link, cssInfoObject.page[which]).then((value) => {
                        const hold = addHead(`[********HEADING**********]${obj.name}\n[*********HEADING*********]\n`, htmlToText(value[0].innerHTML, {wordwrap: null}), `\n*******ARTICLE END*******\n`);

                        retArray.push(hold);
                    }).catch((err) => {
                        if (err)
                            throw err;
                    })
                }
                console.log(`----${retArray.length}`)
                resolve(retArray)
            }
        }).catch((err) => {
            reject(err)

        });
    })
}