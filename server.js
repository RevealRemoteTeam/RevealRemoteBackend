var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//internal modules
const socketNamespaces = require('./src/modules/socketNamespaces.js');
const remoteRevealEvents = require('./src/modules/revealRemoteEvents.js');

socketNamespaces.value = '';

// routing
app.get('/debug', function(req, res){
	res.sendFile(__dirname+'/src/debug.html');
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



// start http listener
http.listen(8080, function(){
	console.log('listening on *:8080');
});
