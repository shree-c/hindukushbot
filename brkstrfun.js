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

// let a = ["all the fucikng things in the world", "are sometimes good"]
// console.log(breakStr(a, 5))
module.exports = breakStr