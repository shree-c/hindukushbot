const { htmlToText } = require('html-to-text');
const { genAxiosget } = require('./getart')
const monthArray = ["January", "Febuary", "March", "April", "May", "June", "July", "Auguest", "Sepetember", "October",
    "November", "December"];
const brkstrfun = require('./brkstrfun')
//this is the universal object for css related data sotrage
//for storing articles
const bodyContents = {
    lead: null,
    editorial: null,
}
const genUrl = "https://www.thehindu.com/opinion/";
const cssInfoObject = {
    info: {
        editorial: ".story-card h3 a",
        lead: ".story-card h3 a",
    },
    page: {
        editorial: '#artmeterinlinewrap ~ div',
        lead: '#artmeterinlinewrap ~ div',
    }

};

//this is the class to make info objects which contain link heading and date of that article
class MakeNeatObject {
    constructor(link, name, dateStr) {
        this.link = link;
        this.name = name;
        this.date = new Date(...(MakeNeatObject.getDateStrInArray(dateStr)));
        this.ldate = this.date.toLocaleString('en-IN', {timeZone: 'IST'});
    }
    static getDateStrInArray(dspar) {
        dspar = dspar.split('Published')[1].split(' ');
        return [+dspar[3], monthArray.indexOf(dspar[1]), +(dspar[2].split(',')[0]), dspar[4].split(":")[0], dspar[4].split(":")[1]];
    }
}
//for storing info objects
const masterArrays = {
    lead: [],
    editorial: [],
}
//this function gets the links of all articles the latest ones
function getTodaysArticlesInfo(section) {
    masterArrays[section] = [];
    return new Promise((resolve, reject) => {
        genAxiosget(`${genUrl}${section}`, cssInfoObject.info.lead).then(async (value) => {
            for (let card of value) {
                const hold = new MakeNeatObject(card.href, card.innerHTML, card.title);
                masterArrays[section].push(hold)
                //removed updated time
                // arrayUpdatedTime[section] = (new Date()).getTime();
            }
            masterArrays[section] = masterArrays[section].sort((a, b) => {
                return a.date - b.date;
            });
            //update cached body results also
            console.log('called get body function from get info')
            await getArticleBody(section, filterfun)
            resolve(masterArrays[section])
        }).catch((err) => {
            reject(err);
        })
    })
}

//big get article body function comes here
//gets the article body based on links in article info array it also uses filter function to filter results
//resolves with neatly formatted articles
//no need of getarticleinfocached now
function getArticleBody(which, filterfun) {
    return new Promise(async (resolve, reject) => {
        if (filterfun) {
            const filteredARray = masterArrays[which].filter(filterfun)
            if (filteredARray.length) {
                console.log(`filtered array form article body\n${filteredARray.length}`)
                const retArray = [];
                for (const obj of filteredARray) {
                    await genAxiosget(obj.link, cssInfoObject.page[which]).then((value) => {
                        const hold = addHeadandTail(`[********HEADING**********]${obj.name}\n[*********HEADING*********]\n`, htmlToText(value[0].innerHTML, { wordwrap: null }), `\n*******ARTICLE END*******\nPublished: ${obj.ldate}`);
                        retArray.push(hold);
                    }).catch((err) => {
                        if (err)
                            throw err;
                    })
                }
                bodyContents[which] = retArray;
                resolve(retArray)
            } else {
                const retArray = [`there are no ${which} published in last 24 hours`];
                bodyContents[which] = retArray;
                console.log(`filtered array empty so without filter fun returned array len----`)
                resolve(retArray[which])
            }
        } else {
            throw new Error('nothing to in last 24 hours')
        }
    })
}
//filter function for returning objects
function filterfun(a) {
    const hol = (new Date().getTime()) - a.date.getTime();
    // console.log(`${new Date()}-----${a.date}`)
    return (hol < (1 * 86400000));
}
function addHeadandTail(heading, string, footer) {
    heading = heading + '\n';
    string = string.padStart((heading.length + string.length), heading)
    return string.padEnd((string.length + footer.length), footer);
}

exports.initialise = async function () {
    console.log('called during initilisation')
    await getTodaysArticlesInfo('lead').then((value)=>{
        console.log(value)
        console.log('initilised lead info')
    });
    await getTodaysArticlesInfo('editorial').then((value)=>{
        console.log(value)
        console.log('initilised edi info')
    });

};
//this just returns content from cached array
exports.getbodycontents = function (section) {
    return new Promise((resolve, reject) => {
        if (bodyContents[section])
            resolve(brkstrfun(bodyContents[section], 4000));
        else
            reject(new Error('null body content this should not happen'))
    })
}

// exports.arr = masterArrays;
// exports.getTodaysArticlesInfo = getTodaysArticlesInfo
//******************sheduling/
const schedule = require('node-schedule');
const rule = new schedule.RecurrenceRule();
rule.hour = [new schedule.Range(0, 6)];
rule.minute = [0, 30];
rule.second = 0;
const job = schedule.scheduleJob(rule, async function () {
    try {
        console.log('calling getinfo fun from schedule\n\n\n\n')
        await getTodaysArticlesInfo('lead').then((value)=>{
            console.log('lead shedule fun')
            console.log(value)
        })
        await getTodaysArticlesInfo('editorial').then((value)=>{
            console.log('edi shedule fun')
            console.log(value)
        })
    } catch (err) {
        console.log(err)
    }
});