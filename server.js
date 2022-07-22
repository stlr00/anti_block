const http = require('http');
const fs = require('fs');
const url = require('url')
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({});
const {writeFile} = require('./generatePac')

writeFile()

http.createServer(function (request, response) {
    if (request.url === '/proxy.pac') {
        fs.readFile('./pac.js', (err, data) => {
            response.writeHead(200, {'Content-Type': 'application/x-ns-proxy-autoconfig'})
            response.end(data, 'utf-8');
        })
    } else {
        console.log('SOMETHING NEW!!!')
        proxy.web(request, response, {target: request.url})
    }
}).listen(80, () => {
    console.log('Server has been started')
}).on('connect', (req, socket, head) => {
    const reqUrl = url.parse('https://' + req.url);
    console.log('proxy for https request: ' + reqUrl.href + '(path encrypted by ssl)');
})

