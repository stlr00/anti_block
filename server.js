const http = require('http');
const fs = require('fs');
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({});
const {writeFile} = require('./generatePac')

writeFile()

http.createServer(function (request, response) {
    console.log(request.url)
    if (request.url === '/proxy.pac') {
        fs.readFile('./pac.js', (err, data) => {
            response.writeHead(200, {'Content-Type': 'application/x-ns-proxy-autoconfig'})
            response.end(data, 'utf-8');
        })
    } else {
        proxy.web(request, response, {target: request.url})
    }
}).listen(80, () => {
    console.log('Server has been started')
});

