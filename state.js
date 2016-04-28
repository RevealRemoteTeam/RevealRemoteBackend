function State(obj) {
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) {
			this[key] = obj[key];
		}
	}
};

function _getEmittableState (obj) {
	return {
		progress: obj.progress,
		slideNotes: obj.slideNotes,
		presentationConnected: obj.presentationConnected
	};
};

State.prototype = {
	emitState: function (to) {
		console.log('emit state');
		to.emit('state', _getEmittableState(this));
	},
	emitToPresenters: function () {
		var args = Array.prototype.slice.call(arguments, 0);
		console.log('emit ' + args[0] + ' to presenters');
		this.presenters.forEach(function (presenter) {
			presenter.socket.emit.apply(presenter.socket, args);
		});
	},
	emitStateToPresenters: function () {
		console.log('emit state to presenters');
		this.emitToPresenters('state', _getEmittableState(this));
	},
	getEmittableState: function () {
		return _getEmittableState(this);
	}
};

module.exports = State;