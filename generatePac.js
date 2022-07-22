const fs = require("fs");

const PROXIES = 'PROXY 89.22.231.161:80; HTTP 89.22.231.161:80; DIRECT'

async function getList() {
    const res = await fetch('https://raw.githubusercontent.com/anticensority/generated-pac-scripts/master/anticensority.pac')
    return await res.text()
}

async function writePac() {
    let pacFile = await getList()

    const proxyString = `PROXY_STRING = "${PROXIES}";`

    pacFile = pacFile.replace('PROXY_STRING = TOR_PROXIES;', proxyString)
    fs.writeFileSync('./pac.js', pacFile)
}

writePac()

module.exports = {writePac}
