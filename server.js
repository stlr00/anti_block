const net = require('net');
const http = require('http');
const url = require('url');
const fs = require("fs");
const {config} = require('dotenv')

config()

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
            clientRes.writeHead(res.statusCode, res.headers).end(res)
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
proxyServer.on('connect', (clientReq, clientSocket) => {
    const reqUrl = url.parse('https://' + clientReq.url);
    const options = {
        port: parseInt(reqUrl.port),
        host: reqUrl.hostname
    };
    // create socket connection for client, then pipe (redirect) it to client socket

    const serverSocket = net.connect(options, () => {


        if (options.host === 'scontent-hel3-1.cdninstagram.com/') {
            const buff = []


            serverSocket.on('data', (data) => {
                console.log('data from cdn')
                buff.push(data)
                console.log(data.toString())
            })


            serverSocket.on('end', () => {
                console.log(Buffer.concat(buff).toString())
            })
        } else {
            clientSocket.write('HTTP/1.1 200 OK\r\n\r\n')
        }


        clientSocket.pipe(serverSocket);
        serverSocket.pipe(clientSocket);
    });



    clientSocket.on('error', (e) => {
        console.error("Client socket error: " + e);
        // serverSocket.end();
    });

    serverSocket.on('error', (e) => {
        console.error("Forward proxy server connection error: " + e);
        clientSocket.end();
    });


});

proxyServer.on('clientError', (err, clientSocket) => {
    console.error('Client error: ' + err);
    clientSocket.destroy()
    clientSocket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

proxyServer.listen(80, () => {
    console.log('Forward proxy server started, listening on port 80');
});
