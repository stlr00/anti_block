const net = require('net');
const http = require('http');
const url = require('url');
const fs = require("fs");
const {writePac} = require('./generatePac')

writePac()

const proxyServer = http.createServer(httpOptions);

// handle http proxy requests
function httpOptions(clientReq, clientRes) {
    if (clientReq.url === '/proxy.pac') {
        fs.readFile('./pac.js', (err, data) => {
            clientRes.writeHead(200, {
                'Content-Type': 'application/x-ns-proxy-autoconfig',
                'Cache-Control': 'max-age=86400'
            })
            clientRes.end(data, 'utf-8');
        })
    } else {
        const reqUrl = url.parse(clientReq.url);

        const options = {
            hostname: reqUrl.hostname,
            port: reqUrl.port,
            path: reqUrl.path,
            method: clientReq.method,
            headers: clientReq.headers
        };

        // create socket connection on behalf of client, then pipe the response to client response (pass it on)
        const serverConnection = http.request(options, function (res) {
            clientRes.writeHead(res.statusCode, res.headers)
            res.pipe(clientRes);
        });

        clientReq.pipe(serverConnection);

        clientReq.on('error', (e) => {
            console.error('Client socket error: ' + e);
        });

        serverConnection.on('error', (e) => {
            console.error('Server connection error: ' + e);
        });
    }
}

// handle https proxy requests (CONNECT method)
proxyServer.on('connect', (clientReq, clientSocket, head) => {
    const reqUrl = url.parse('https://' + clientReq.url);

    const options = {
        port: reqUrl.port,
        host: reqUrl.hostname
    };

    // create socket connection for client, then pipe (redirect) it to client socket
    const serverSocket = net.connect(options, () => {
        clientSocket.write('HTTP/' + clientReq.httpVersion + ' 200 Connection Established\r\n' +
            'Proxy-agent: Node.js-Proxy\r\n' +
            '\r\n', 'UTF-8', () => {
            // creating pipes in both ends
            serverSocket.write(head);
            serverSocket.pipe(clientSocket);
            clientSocket.pipe(serverSocket);
        });
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

proxyServer.on('clientError', (err, clientSocket) => {
    console.error('Client error: ' + err);
    clientSocket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

proxyServer.listen(80, () => {
    console.log('Forward proxy server started, listening on port 80');
});


