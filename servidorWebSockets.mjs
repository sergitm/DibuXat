/******************************************************************************
 *					SERVIDOR WEB SOCKETS (port 8180)
 *******************************************************************************/

// Afegir el mòdul 'ws'
import WebSocket, {
	WebSocketServer
} from 'ws';

// Crear servidor WebSockets i escoltar en el port 8180
const wsServer = new WebSocketServer({
	port: 8180
});
let paths = [];

console.log("Servidor WebSocket escoltant en http://localhost:8180");

// Enviar missatge a tothom excepte a 'clientExclos'
//	(si no s'especifica qui és el 'clientExclos', s'envia a tots els clients)
function broadcast(missatge, clientExclos) {
	wsServer.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN && client !== clientExclos) {
			client.send(missatge);
		}
	});
}

// Al rebre un nou client (nova connexió)
wsServer.on('connection', (client, peticio) => {
	// Guardar identificador (IP i Port) del nou client
	let id = peticio.socket.remoteAddress + ":" + peticio.socket.remotePort;

	// Enviar salutació al nou client
	//	i avisar a tots els altres que s'ha afegit un nou client
	client.send(JSON.stringify({accio:'id', id: id }));
	console.log(`Nou client afegit: ${id}`);

	// Al rebre un missatge d'aques client
	//	reenviar-lo a tothom (inclòs ell mateix)
	
	client.on('message', missatge => {
		missatge = JSON.parse(missatge);
		//switch per comprobar la acció del missatge
		switch (missatge.accio) {
			//Si la accio es newPath afegim el path al array de paths y envíem el path a tots els clients menys al que ha enviat el message
			case "newPath":
				paths.push(missatge.path);
				//Enviar paths a tots els clients
				broadcast(JSON.stringify({
					accio: "new Path",
					paths: paths
				}), client);
				break;
			default:
				break;
		}
		broadcast(`<strong>${id}: </strong>${missatge}`);
		console.log(`Missatge de ${id} --> ${missatge}`);
	});
});