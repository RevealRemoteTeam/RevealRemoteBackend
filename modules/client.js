function Client(obj) {
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) {
			this[key] = obj[key];
		}
	}
};

Client.prototype = {
	getEmittableClient: function () {
		return {
			handshake: this.handshake,
			type: this.type,
			uuid: this.uuid
		};
	}
};

module.exports = Client;