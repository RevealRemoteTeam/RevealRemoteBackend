var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


// routing
app.get('/debug', function(req, res){
  res.sendFile(__dirname+'/src/debug.html');
});

var magicPresentationBindings = {}; // i.e. "mary had a little lamb": Socket
var magicNicknamesBindings = {}; // i.e. "mary had a little lamb": ["Alpha", "Bravo", "Charlie"]
var socketDataBindings = {}; // i.e. Socket: { magicString: "mary had a little lamb" }

// socket.io binding
var presenterNsp = io.of('/presenter');
var presentationNsp = io.of('/presentation');


presenterNsp.on('connection', function(socket){
  console.log('a presenter connected');
  if(socketDataBindings[socket]){
    console.log('reconnected*');
  }
  else{
    socketDataBindings[socket] = {};
  }
  socket.on('disconnect', function(){
    console.log('presenter disconnected');
  });

  socket.on('handshake', function(handshakeData){
    if(!_validate('handshake', handshakeData))
      return;

    if(magicNicknamesBindings[handshakeData.magic]){
      if(magicNicknamesBindings[handshakeData.magic].includes(handshakeData.nickname))
        return;
    }
    else{
      magicNicknamesBindings[handshakeData.magic] = [handshakeData.nickname];
    }

    socketDataBindings[socket].magic = handshakeData.magic;
  });
});

presentationNsp.on('connection', function (socket){
  socket.on('handshake', function(handshakeData){

  });
})

// start http listener
http.listen(8080, function(){
  console.log('listening on *:8080');
});

var validate = (function(){
  var _validationPatterns = {
    action: /^[a-zA-Z]{1,30}$/,
    errorType: /^validation|duplicate$/,
    magic: /^[a-zA-Z0-9 ]{4,60}$/,
    message: /^[a-zA-Z0-9 ]{1,40}$/,
    nickname: /^[a-zA-Z0-9 ]{1,20}$/,
    progress: 'number',
    slideNotes: 'string',
    presentationConnected: 'boolean'
  };

  var _models = {
    handshakePresenter: ['magic', 'nickname'],
    handshakePresentation: ['magic'],
    control: ['action'],
    'not ok': ['errorType'],
    state: ['presentationConnected', 'progress', 'slideNotes']
  };

  function _validate(modelName, obj){
    var model = _models[modelName];
    if(!model.every(function(field){
      return obj.hasOwnProperty(field) && _validateField(field, obj[field]);
    }))
      return false;

    function _validateField(field, value){
      var pattern = _validationPatterns[field];

      if(pattern instanceof RegExp){
        if(!pattern.test(value)){
          return false;
        }
      }
      else{
        if(typeof value !== pattern){
          return false;
        }
      }
    }
  };

  return _validate;
})();