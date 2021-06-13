//this function strings in an array to required lengths and makes array of chunks-strings and pushes them
//in turn into another array and returns it
function breakStr(bigArr, chunksize) {
    const retArr = [];
    for (const obj of bigArr) {
        let smArr = [];
        for (let i = 0, j = chunksize; i < obj.length;) {
            smArr.push(obj.slice(i, j)); // sliced array
            // console.log(`${i}---${j}`)
            i += chunksize;
            j += chunksize;
        }
        retArr.push(smArr);
        smArr = [];
    }
    return retArr;
}
module.exports = breakStr