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
let admin = false;
let width = 640;
let height = 480;
let tolerancia = 1;
let clients = [];

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


	// Enviar-li el seu identificador
	client.send(JSON.stringify({
		accio: 'id',
		id: id
	}));
	console.log(`Nou client afegit: ${id}`);
	client.paths = [];
	client.id = id;

	// Si hi ha un admin, enviar-li la llista de ids clients
	if (admin) {
		enviarIds();
	}

	updatePathsClients();

	client.on('message', missatge => {
		missatge = JSON.parse(missatge);
		//switch per comprobar la acció del missatge
		switch (missatge.accio) {
			case "newPath":
				paths.push(missatge.path);
				client.paths.push(missatge.path);
				updatePathsClients();

				break;
			case "clear":
				paths = paths.filter(path => !client.paths.includes(path));
				client.paths = [];
				updatePathsClients();
				break;
			case "desfer":
				paths = paths.filter(path => path !== client.paths[client.paths.length - 1]);
				client.paths.pop();
				updatePathsClients();
				break;
			case "clearAll":
				paths = [];
				updatePathsClients();
				break;
			case "config":
				//comprobar si client es admin
				if (client.admin == true) {
					//comprobar que la config es correcta
					if (missatge.width >= 640 && missatge.width <= 1280 && missatge.height >= 480 && missatge.height <= 720 && tolerancia >= 1 && tolerancia <= 5) {
						width = missatge.width;
						height = missatge.height;
						tolerancia = missatge.tolerancia;
						broadcast(JSON.stringify({
							accio: "config",
							width: width,
							height: height
						}));
					}
				}
				break;
			case "admin":
				if (!admin) {
					admin = client;
					client.admin = true;
					enviarIds();
				} else {
					client.send(JSON.stringify({
						accio: "close"
					}));
					
					client.close();
				};
				break;
			case "clearClient":

				//Eliminar paths del client i eliminar els seus paths del array de paths
				var id = missatge.id;
				var cli;
				wsServer.clients.forEach(function each(client) {
					if (client.id == id) cli = client;
				});
				if (cli == undefined) return;
				
				paths = paths.filter(path => !cli.paths.includes(path));
				cli.paths = [];
				updatePathsClients();
				break;

			default:
				break;
		}
	});

	client.on('close', () => {
		if (client.admin == true) {
			admin = false;
			width = 640;
			height = 480;
			tolerancia = 1;
			broadcast(JSON.stringify({
				accio: "config",
				width: width,
				height: height,
				tolerancia: tolerancia
			}));
		} else {
			// Eliminar el client de la llista de clients
			enviarIds();
			paths = paths.filter(path => !client.paths.includes(path));
			updatePathsClients();
			console.log(`Client tancat: ${id}`);
		}

	});
});

function updatePathsClients() {
	broadcast(JSON.stringify({
		accio: "updatePath",
		paths: paths
	}));
}



function enviarIds() {
	var ids = [];
	wsServer.clients.forEach(function each(client) {
		if (!client.admin) ids.push(client.id);
	});
	admin.send(JSON.stringify({
		accio: "clients",
		ids: ids
	}));

}