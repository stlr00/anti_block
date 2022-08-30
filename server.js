import {config} from "dotenv";
import * as http from "http";
import * as net from "net";
import * as url from "url";
import * as fs from "fs";
import {writePac} from "./generatePac.js";
import {blockedIp} from "./blockedIp.js";

config()

await writePac()

const server = http.createServer(httpOptions);

function httpOptions(req, socket) {
    if (req.url === '/proxy.pac') {
        socket.writeHead(200, {
            'Content-Type': 'application/x-ns-proxy-autoconfig',
            'Cache-Control': 'max-age=86400'
        })

        const fileStream = fs.createReadStream('./pac.js')
        fileStream.pipe(socket)
    } else {
        socket.destroy(new Error('ECONNRESET'))
    }
}

server.on('connect', (req, clientSocket) => {
    if (blockedIp.includes(req.url)) {
        return clientSocket.end()
    }
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

server.on('clientError', (err, socket) => {
    if (err.code === 'ECONNRESET' || !socket.writable) {
        return;
    }

    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.on('error', (err) => {
    console.log('error!')
    console.log(err)
})

server.listen(80, () => {
    console.log('Forward proxy server started, listening on port 80');
});
