const {getArticleBody, fun, realfilterfun} = require('./index.js')
// const {cachedfun} = require('./app')
// fun('lead').then((value)=>{
//     console.log(value)
// })

// cachedfun('lead').then((value)=>{
//     console.log(value)
// })
getArticleBody('editorial', realfilterfun).then((value)=>{
    console.log(value)
})