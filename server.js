const net = require('net');
const http = require('http');
const url = require('url');
const fs = require("fs");
const {config} = require('dotenv')

config()

const {writePac} = require('./generatePac')

writePac()

const server = http.createServer(httpOptions);

function httpOptions(req, socket) {
    if (req.url === '/proxy.pac') {
        const fileStream = fs.createReadStream('./pac.js')
        fileStream.pipe(socket)

        socket.writeHead(200, {
            'Content-Type': 'application/x-ns-proxy-autoconfig',
            'Cache-Control': 'max-age=86400'
        })


    } else {
        socket.destroy(new Error('ECONNRESET'))
    }
}

server.on('connect', (req, clientSocket) => {
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

server.listen(80, () => {
    console.log('Forward proxy server started, listening on port 80');
});
