var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


// routing
app.get('/debug', function(req, res){
	  res.sendFile(__dirname+'/src/debug.html');
});



// socket.io binding
var presenterNsp = io.of('/presenter');
var presentationNsp = io.of('/presentation');


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
