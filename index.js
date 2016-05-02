var express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const env = require('./env');
const constants = require('./modules/const');
const validation = require('./modules/validation');
const State = require('./modules/state');
const Client = require('./modules/client');

app.use(express.static('www'));

if (env.environment === 'development') {
	app.get('/memory', function (req, res) {
		var clientsCopy = {};
		for (var key in clients) {
			clientsCopy[key] = clients[key].getEmittableClient();
		}

		var statesCopy = {};
		for (var key in states) {
			statesCopy[key] = states[key].getEmittableState();
		}
		res.type('text/plain').send(JSON.stringify({
			clients: clientsCopy,
			states: statesCopy
		}, null, 4));
	});
}

function debug () {
	if (env.environment === 'development') {
		console.log.apply(console, Array.prototype.slice.call(arguments, 0));
	}
};

// Client householding
const clients = {};
const states = {};

io.of('/presenter').on('connection', function (socket) {
	socket.on('handshake', _handleHandshake.bind(null, socket, 'presenter'));

	socket.on('control', function (controlData) {
		var client = clients[socket.id];
		if (!client) {
			return;
		}

		var state = states[client.roomId];
		if (state.presentation) {
			state.presentation.socket.emit('control', controlData);
		}
	});

	socket.on('disconnect', function () {
		var client = clients[socket.id];
		if (!client) {
			// client hasn't handshaked so, no problems!
			return;
		}
		delete clients[socket.id];

		client.state.presenters.splice(client.state.presenters.indexOf(client), 1);

		if (client.state.presenters.length === 0 && !client.state.presentationConnected) {
			delete states[client.roomId];
		}
	});
});

io.of('/presentation').on('connection', function (socket) {
	socket.on('handshake', _handleHandshake.bind(null, socket, 'presentation'));

	socket.on('disconnect', function () {
		var client = clients[socket.id];
		if (!client) {
			// client hasn't handshaked so, no problems!
			return;
		}

		delete clients[socket.id];

		var state = states[client.roomId];

		state.presentationConnected = false;
		state.presentation = null;
		debug("disconnect from presentation: emit state to presenters");
		state.emitStateToPresenters();
	});

	socket.on('state', function (stateData) {
		var client = clients[socket.id];
		if (!client || !validation.validator(stateData, constants.mandatoryFieldsPresentationState)) {
			return;
		}
		var state = states[client.roomId];

		state.progress = stateData.progress;
		state.slideNotes = stateData.slideNotes;

		debug("state from presentation: emit state to presenters");
		state.emitStateToPresenters();
	});
});

function _handleHandshake (socket, type, handshakeData) {
	var error;

	if (!validation.validator(handshakeData, type === 'presentation' ? constants.mandatoryFieldsPresentationHandshake : constants.mandatoryFieldsPresenterHandshake)) {
		error = 'validation';
	}

	if (type === 'presentation') {
		// no duplicate roomId allowed
		if (states[handshakeData.roomId] && states[handshakeData.roomId].presentationConnected) {
			error = 'duplicate';
		}
	}

	if (clients[socket.id]) {
		error = 'duplicate';
	}

	if (error) {
		socket.emit('not ok', { errorType: error });
		return;
	}

	clients[socket.id] = new Client({
		roomId: handshakeData.roomId,
		socket: socket
	});

	socket.emit('ok');

	// send state if it exists
	if (states[handshakeData.roomId]) {
		var state = states[handshakeData.roomId];
		clients[socket.id].state = state;

		if (type === 'presentation') {
			state.presentationConnected = true;
			state.presentation = clients[socket.id];

			// Let all others know a presentation was connected
			debug("handshake from presentation: emit state to presenters");
			state.emitStateToPresenters();
		}
		else {
			state.presenters.push(clients[socket.id]);
			if (state.presentation) {
				state.presentation.socket.emit('presenter connected');
			}
		}

		// Get the client a copy of the state if it's a presenter
		if (type === 'presenter') {
			state.emitState(socket);
		}
	}
	else {
		// Create a new state with the roomId
		var state = new State({
			progress: null,
			slideNotes: null,
			presentationConnected: type === 'presentation',
			presentation: type === 'presentation' ? clients[socket.id] : null,
			presenters: []
		});

		clients[socket.id].state = state;

		states[handshakeData.roomId] = state;

		// Get the client a copy of the state if it's a presenter
		if (type === 'presenter') {
			// Throw presenter in the state's presenter collection
			state.presenters.push(clients[socket.id]);
			state.emitState(socket);
		}
	}
};

http.listen(env.port, function () {
	console.log("Started listening on port " + env.port);
});