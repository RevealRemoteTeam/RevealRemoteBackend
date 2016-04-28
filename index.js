/**
 * TODO: check validation of state from presentation; optional slideNotes
 */

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const validation = require('./validation');
const State = require('./state');
const Client = require('./client');
const constants = require('./const');

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
})

// Client householding
const clients = {};
const states = {};

io.of('/presenter').on('connection', function (socket) {
	socket.on('handshake', _handleHandshake.bind(null, socket, 'presenter'));

	socket.on('control', function (controlData) {
		var client = clients[socket.id];
		var state = states[client.handshake.magic];
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
			delete states[client.handshake.magic];
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

		var magic = client.handshake.magic;
		var state = states[magic];

		state.presentationConnected = false;
		state.presentation = null;
		state.emitStateToPresenters();
	});

	socket.on('state', function (stateData) {
		if (!validation.validator(stateData, constants.mandatoryFieldsPresentationState)) {
			console.log('validation error @/presentation/state', stateData);
			return;
		}

		var client = clients[socket.id];
		var magic = client.handshake.magic;
		var state = states[magic];

		state.progress = stateData.progress;
		state.slideNotes = stateData.slideNotes;
		state.emitStateToPresenters();
	});
});

function _handleHandshake (socket, type, handshakeData) {
	var error;

	if (!validation.validator(handshakeData, type === 'presentation' ? constants.mandatoryFieldsPresentationHandshake : constants.mandatoryFieldsPresenterHandshake)) {
		error = 'validation';
	}

	if (type === 'presentation') {
		// no duplicate magic string allowed
		if (states[handshakeData.magic] && states[handshakeData.magic].presentationConnected) {
			error = 'duplicate';
		}
	}
	else if (type === 'presenter') {
		// no duplicate nicknames within room possible
		if (states[handshakeData.magic]) {
			if (states[handshakeData.magic].presenters.some(function (presenter) {
				return presenter.handshake.nickname === handshakeData.nickname;
			})) {
				error = 'duplicate';
			}
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
		handshake: handshakeData,
		socket: socket
	});

	socket.join(handshakeData.magic);
	socket.emit('ok');

	// send state if it exists
	if (states[handshakeData.magic]) {
		var state = states[handshakeData.magic];
		clients[socket.id].state = state;

		if (type === 'presentation') {
			state.presentationConnected = true;
			state.presentation = clients[socket.id];

			// Let all others know a presentation was connected
			state.emitStateToPresenters();

		}
		else {
			state.presenters.push(clients[socket.id]);
		}

		// Get the client a copy of the state if it's a presenter
		if (type === 'presenter') {
			state.emitState(socket);
		}
	}
	else {
		// Create a new state with the magic string
		var state = new State({
			progress: null,
			slideNotes: null,
			presentationConnected: type === 'presentation',
			presentation: type === 'presentation' ? clients[socket.id] : null,
			presenters: []
		});

		clients[socket.id].state = state;

		states[handshakeData.magic] = state;

		// Get the client a copy of the state if it's a presenter
		if (type === 'presenter') {
			// Throw presenter in the state's presenter collection
			state.presenters.push(clients[socket.id]);
			state.emitState(socket);
		}
	}
};

http.listen(8234, function () {
	console.log("Started listening on 8234");
});