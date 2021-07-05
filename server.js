const PORT = process.env.PORT || 81;
const express = require('express');
const path = require('path');
const ws = require('ws');
// const ip = require('ip');
const app = express()
	.use(express.static(path.join(__dirname, 'public')))
	// 	.set('views', path.join(__dirname, 'views'))
	// 	.set('view engine', 'ejs')
	.get('/', (req, res) => res.render('index', { value: null }))
	.listen(PORT, () => console.log(`Listening on ${PORT}`));
// .listen(PORT, () => console.log(`Listening on ${ip.address()}:${PORT}`));

const server = new ws.Server({ server: app, path: '/' });

// Co client ket noi toi server
server.on('connection', (socket) => {
	// Dong ket noi
	socket.on('close', () => {
		console.log(`${socket.id}: Disconnected`);
	});

	// Ket noi bi loi
	socket.on('error', function () {
		console.log(`${socket.id}: Connection error`);
	});

	// Co mesage gui den server
	socket.on('message', function (data) {
		if (typeof data != "string") {
			console.log(`${socket.id}(tx): ${data.length}`);
		}
		else {
			ids = data.split(":");
			if (ids[0] == "id") {
				socket.id = ids[1];
				console.log(`${socket.id}: Connected`);
			}
			else {
				console.log(`${socket.id}(tx): ${data}`);
			}
		}

		// Chuyen tiep message toi cac client trong cung mang
		server.clients.forEach(function each(client) {
			if (client !== socket && client.readyState === ws.OPEN) {
				if (typeof data === "string")
					console.log(`${client.id}(rx): ${data}`);
				else
					console.log(`${client.id}(rx): ${data.length}`);
				client.send(data);
			}
		});
	});
});