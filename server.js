const http = require('http');
const fs = require('fs');

http.createServer(function (request, response) {
    fs.readFile('./pac.js', (err, data) => {
        response.writeHead(200, {'Content-Type': 'application/x-ns-proxy-autoconfig'})
        response.end(data, 'utf-8');
    })
}).listen(80);
