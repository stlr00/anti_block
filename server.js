import * as http from "http";
import * as net from "net";
import * as url from "url";
import * as fs from "fs";
import {writePac} from "./generatePac.js";
// import {start} from "./wg_server.js";
//
// start()
await writePac()

const server = http.createServer(httpOptions);

function httpOptions(req, res) {
    if (req.url === '/proxy.pac') {
        res.writeHead(200, {
            'Content-Type': 'application/x-ns-proxy-autoconfig',
            'Cache-Control': 'max-age=86400'
        })

        const fileStream = fs.createReadStream('./pac.js')
        fileStream.pipe(res, {end: true})
    } else {
        res.destroy(new Error('ECONNRESET'))
    }
}

server.on('connect', (req, clientSocket) => {
    const ip = clientSocket.remoteAddress.split('ffff:')[1]
    console.log(req.url)
    const reqUrl = url.parse('https://' + req.url);
    const options = {
        port: parseInt(reqUrl.port),
        host: reqUrl.hostname
    };

    const serverSocket = net.connect(options, () => {
        clientSocket.write('HTTP/1.1 200 OK\r\n\r\n')
        clientSocket.pipe(serverSocket);
        serverSocket.pipe(clientSocket);
    });


    clientSocket.on('error', (e) => {
        console.error("Client socket error: " + e);
        serverSocket.end();
    });

    serverSocket.on('error', (e) => {
        console.error("Forward proxy server connection error: " + e);
        clientSocket.end();
    });
});

server.listen(322, () => {
    console.log('Forward proxy server started, listening on port 80');
});
