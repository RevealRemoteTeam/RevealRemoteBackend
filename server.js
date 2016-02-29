var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//internal modules
const socketNamespaces = require('./src/modules/socketNamespaces.js');
const remoteRevealEvents = require('./src/modules/revealRemoteEvents.js');
const validation = require('./src/modules/validation.js');

// routing
app.get('/debug/presenter', function(req, res){
	res.sendFile(__dirname+'/src/debug_presenter.html');
});

app.get('/debug/presentation', function(req, res){
	res.sendFile(__dirname+'/src/debug_presentation.html');
});

// socket.io binding
var presenterNsp = io.of(socketNamespaces.presenter);
var presentationNsp = io.of(socketNamespaces.presentation);


presenterNsp.on('connection', function(socket){
	console.log('a presenter connected');

	socket.on('disconnect', function(){
		console.log('presenter disconnected');
	});
});

presentationNsp.on('connection', function(socket){
	console.log('a presentation connected');

	socket.on('handshake', function (data) {
		if (validation.validator(data)) {
			socket.emit('ok');
		}
		else {
			socket.emit('not ok');
		}
	});

	socket.on('disconnect', function(){
		console.log('presentation disconnected');
	});
});

// start http listener
http.listen(8080, function(){
	console.log('listening on *:8080');
});