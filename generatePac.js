const fs = require("fs");

async function getList() {
    const res = await fetch('https://reestr.rublacklist.net/api/v2/domains/json/')
    return await res.json()
}

async function writeFile() {
    let baseFile = fs.readFileSync('./pac-base.js').toString()
    const RKN_LIST = await getList()

    let str = RKN_LIST.join('.')

    str = str.replaceAll('.', '').replaceAll('*', '')

    baseFile = baseFile.replace('[]', str)
    fs.writeFileSync('./pac.js', baseFile)
}

module.exports = {writeFile}
