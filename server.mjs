/******************************************************************************
*						SERVIDOR WEB (port 8080)
******************************************************************************/
// Importar el mòdul 'http' per crear un servidor que processi missatges HTTP
import { createServer } from 'http';

// Importar el mòdul 'fs' per gestionar arxius
import { existsSync, readFile } from 'fs';



// Tipus d'arxius acceptats
const FILE_TYPES = {
	html:"text/html",
	css:"text/css",
	js:"text/javascript",
	svg:"image/svg+xml",
	png:"image/png",
	gif:"image/gif",
	ico:"image/ico",
	jpg:"image/jpg",
	jpeg:"image/jpg",
};

// Agafar el tipus d'arxiu a partir de l'extensió
function tipusArxiu(filename) {
	let ndx = filename.lastIndexOf('.');
	if (ndx < 0) return undefined;
	
	let ext = filename.substring(filename.lastIndexOf('.') + 1);
	if (ext.length == 0) return undefined;
	
	return FILE_TYPES[ext];
}



// Enviar encapçalament de la resposta al client
function header(resposta, codi, cType) {
	// Permetre peticions de qualsevol origen
	resposta.setHeader('Access-Control-Allow-Origin', '*');
	// Permetre només peticions GET
	resposta.setHeader('Access-Control-Allow-Methods', 'GET');
	// Les dades retornades són codi HTML amb codificació UFT8
	if (cType) resposta.writeHead(codi, {'Content-Type': cType + '; charset=utf-8'});
	else resposta.writeHead(codi);
}

// Envia com a resposta un error i el mostra també a la consola
function missatgeError(resposta, cError, missatge) {
	header(resposta, cError, 'text/html');
	resposta.end("<p style='text-align:center;font-size:1.2rem;font-weight:bold;color:red'>" + missatge + "</p>");
	console.log("\t" + cError + " " + missatge);
}

// Request event manager
//	peticio: objecte per agafar les dades de la petició
//	resposta: objecte per enviar la resposta
function onRequest(peticio, resposta) {
	let cosPeticio = "";

	// Gestió dels esdeveniments
	peticio.on('error', function(err) {	// error
		console.error(err);
	}).on('data', function(dades) {		// dades parcials
		cosPeticio += dades;
	}).on('end', function() {			// s'han rebut totes les dades
		// Gestió d'errors al respondre
		resposta.on('error', function(err) {
			console.error(err);
		});

		// 'url' de la petició
		const base = 'http://' + peticio.headers.host + '/';
		const url = new URL(peticio.url, base);

		// Obtenir la pàgina que es vol obrir (l'arxiu HTML)
		// Si no hi ha cap, agafar "index.html"
		let filename = "." + url.pathname;
		if (filename == "./") filename += "index.html";

		// Enviar arxiu, si existeix
		if (existsSync(filename)) {
			// Mostrar per consola l'arxiu enviat com a resposta
			console.log("Enviant " + filename);

			readFile(filename, function(err, dades) {
				let cType = tipusArxiu(filename);

				if (err) missatgeError(resposta, 400, "Error al llegir l'arxiu " + filename);
				else if (!cType) missatgeError(resposta, 400, "Extensió d'arxiu desconeguda: " + filename);
				else {
					// Enviar arxiu
					header(resposta, 200, cType);
					resposta.end(dades);
				}
			});
		}
		else missatgeError(resposta, 404, "Not Found (" + filename + ")");
	});
}

const server = createServer();
server.on('request', onRequest);

server.listen(8080);	
console.log("Servidor escoltant en http://localhost:8080");

