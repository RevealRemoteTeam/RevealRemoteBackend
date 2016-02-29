// definition of events that can be triggered by reveal remote clients

// presenter to server events
var presenterToServerEvents = {
	get control() {return 'control';},
	get handshake() {return 'handshake';}
}
this.__defineGetter__("presenterToServer", function(){ return presenterToServerEvents; });


// server to presenter events
var serverToPresenterEvents = {
	get ok() {return 'ok';},
	get notOk() {return 'not ok';},
	get state() {return 'state';}
}
this.__defineGetter__("serverToPresenter", function(){ return serverToPresenterEvents; });


// presentation to server events
var presentationToServerEvents = {
	get handshake() {return 'handshake';},
	get slideChanged() {return 'slide changed';}
}
this.__defineGetter__("presentationToServer", function(){ return presentationToServerEvents; });

// server to presentation events
var serverToPresentationEvents = {
	get ok() {return 'ok';},
	get notOk() {return 'not ok';},
	get control() {return 'control';},
	get notification() {return 'notification';}
}
this.__defineGetter__("serverToPresentation", function(){ return serverToPresentationEvents; });
