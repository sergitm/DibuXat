import { createServer } from 'http';
import * as fs from 'fs';

function onRequest(request, response) {
    // 'url' de la petició
    const base = 'http://' + request.headers.host + '/';
    const url = new URL(request.url, base);

    const rhct = request.headers['content-type'];
    // Si la petició es post:
    if (request.method == 'POST') {
        request.on('data', function (data) {
        });
        request.on('end', function () {
        });
        // Si la petició no és POST, retornem el fitxer index.html
    } else {

        let filename = "." + url.pathname;
        if (filename == "./") filename += "index.html";
        fs.readFile(filename, function (err, dades) {
            response.end(dades);
        });
    }
}

// Server data
const server = createServer();
server.on('request', onRequest);

server.listen(8080);
console.log("Servidor escoltant en http://localhost:8080");