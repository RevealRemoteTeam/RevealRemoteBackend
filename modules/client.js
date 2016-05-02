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
			roomId: this.roomId
		};
	}
};

module.exports = Client;