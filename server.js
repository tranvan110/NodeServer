
const ENVIRONMENT = 'development';
if (ENVIRONMENT != 'development') {
	console.log = function () { };
}

const PORT = process.env.PORT || 5000;
const express = require('express');
const path = require('path');
const ws = require('ws');
// const ip = require('ip');

const app = express()
	.use(express.static(path.join(__dirname, 'public')))
	// 	.set('views', path.join(__dirname, 'views'))
	// 	.set('view engine', 'ejs')
	.get('*', (req, res) => res.render('index', { value: null }))
	.listen(PORT, () => console.log(`Listening on ${PORT}`));
// .listen(PORT, () => console.log(`Listening on ${ip.address()}:${PORT}`));
const server = new ws.Server({ server: app, path: '/' });

server.on('connection', (socket) => {
	socket.on('close', () => {
		console.log(`${socket.id}: offline`);
	});

	socket.on('error', function () {
		console.log(`${socket.id}: error`);
	});

	socket.on('message', function (data) {
		if (typeof data == "string") {
			var ids = data.split(":");
			if (ids[0] == "id") {
				socket.id = ids[1];
				console.log(`${socket.id}: online`);
			}
			else if (ids[0] == "to") {
				socket.to = ids[1];
				console.log(`Dir: ${socket.id}->${socket.to}`);
			}
			else {
				console.log(`${socket.id}(tx): ${data}`);
			}
		}
		else {
			console.log(`${socket.id}(tx) size: ${data.length}`);
		}

		server.clients.forEach(function each(client) {
			if (client !== socket && client.readyState === ws.OPEN) {
				if (socket.to == 'all' || socket.to == client.id) {
					if (typeof data === "string")
						console.log(`${client.id}(rx): ${data}`);
					else
						console.log(`${client.id}(rx) size: ${data.length}`);
					client.send(data);
				}
			}
		});
	});
});