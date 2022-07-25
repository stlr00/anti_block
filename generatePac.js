const fs = require("fs");

const PROXY = process.env.PROXY;

async function getList() {
    const res = await fetch('https://cloudflare-ipfs.com/ipfs/QmXPVA3P72hMURKvCmdQmdAVRk91J1WgEqsA7HPG3szH8Q/proxy-ssl.js')
    return await res.text()
}

async function writePac() {
    let pacFile = await getList()

    pacFile = pacFile.replace(
        'HTTPS proxy-fbtw-ssl.antizapret.prostovpn.org:3143; DIRECT',
        'HTTPS proxy-ssl.antizapret.prostovpn.org:3143; PROXY proxy-nossl.antizapret.prostovpn.org:29976; HTTP proxy-nossl.antizapret.prostovpn.org:29976; DIRECT'
    )
    pacFile = pacFile.replace(
        'HTTPS proxy-ssl.antizapret.prostovpn.org:3143; PROXY proxy-nossl.antizapret.prostovpn.org:29976; DIRECT',
        PROXY
    )
    fs.writeFileSync('./pac.js', pacFile)
}

module.exports = {writePac}
