import * as express from 'express'
import {readFileSync, writeFileSync} from 'fs'
import {execSync} from 'child_process'


const app = express()


app.post('/wg', (req, res) => {
    const name = req.body

    const file = readFileSync('/etc/wireguard/wg0.conf').toString()

    const idxSlash = file.lastIndexOf('/')
    const idxDot = file.lastIndexOf('.')

    const subNumber = file.substring(idxDot + 1, idxSlash - 1)
    const lastNumber = parseInt(subNumber, 10)

    const newNumber = lastNumber + 1;

    execSync(`wg genkey | tee /etc/wireguard/${name}_privat | wg pubkey | tee /etc/wireguard/${name}_pub`, {encoding: 'utf-8'})

    const pubkey = readFileSync(`/etc/wireguard/${name}_pub`).toString()

    const newFile = file + getTemplate(pubkey, newNumber)

    writeFileSync('/etc/wireguard/wg0.conf', newFile)

    execSync('systemctl restart wg-quick@wg0', {encoding: 'utf-8'})

    const privatKey = readFileSync(`/etc/wireguard/${name}_privat`).toString()

    const fileToClient = getNewFile(privatKey, newNumber)

    res.writeHead(200, {
        'Content-Disposition': `attachment; filename="wg.conf"`
    })

    const download = Buffer.from(fileToClient, 'utf-8')
    res.end(download)

})

function getTemplate(key, number) {
    return `
[Peer]
PublicKey = ${key}
AllowedIPs = 10.0.0.${number}/32
`
}

function getNewFile(key, number) {
    return `
[Interface]
PrivateKey = ${key}
Address = 10.0.0.${number}/32
DNS = 8.8.8.8

[Peer]
PublicKey = 1tceQN8uzMSCHi7TmROvwcTb5TXuxdNpqaAaoN82SxE=
AllowedIPs = 0.0.0.0/0
Endpoint = 89.22.231.161:51830
PersistentKeepalive = 20
`
}

function start () {
    app.listen(323)
}

export {start}
