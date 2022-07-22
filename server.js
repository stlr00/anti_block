const net = require('net');
const http = require('http');
const url = require('url');
const fs = require("fs");
const {config} = require('dotenv')

config()

const {writePac} = require('./generatePac')

writePac()

const proxyServer = http.createServer(httpOptions);

function httpOptions(clientReq, clientRes) {
    if (clientReq.url === '/proxy.pac') {
        clientRes.writeHead(200, {
            'Content-Type': 'application/x-ns-proxy-autoconfig',
            'Cache-Control': 'max-age=86400'
        })

        const fileStream = fs.createReadStream('./pac.js')

        fileStream.pipe(clientRes)
        fileStream.on('end', clientRes.end)
    } else {
        clientRes.destroy()
    }
}

proxyServer.on('connect', (clientReq, clientSocket) => {
    const reqUrl = url.parse('https://' + clientReq.url);
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
        // console.error("Client socket error: " + e);
        serverSocket.end();
    });

    serverSocket.on('error', (e) => {
        console.error("Forward proxy server connection error: " + e);
        clientSocket.end();
    });


});

proxyServer.on('clientError', (err, clientSocket) => {
    console.error('Client error: ' + err);
    clientSocket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

proxyServer.listen(80, () => {
    console.log('Forward proxy server started, listening on port 80');
});
