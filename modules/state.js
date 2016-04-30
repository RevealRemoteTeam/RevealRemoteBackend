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
		to.emit('state', _getEmittableState(this));
	},
	emitToPresenters: function () {
		var args = Array.prototype.slice.call(arguments, 0);
		this.presenters.forEach(function (presenter) {
			presenter.socket.emit.apply(presenter.socket, args);
		});
	},
	emitStateToPresenters: function () {
		this.emitToPresenters('state', _getEmittableState(this));
	},
	getEmittableState: function () {
		return _getEmittableState(this);
	}
};

module.exports = State;