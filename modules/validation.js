function Optional (value) {
	this.value = value;
};

// validation patterns

this.__defineGetter__("action", function(){ return /^[a-zA-Z]{1,30}$/; });
this.__defineGetter__("errorType", function(){ return /^validation|duplicate$/; });
this.__defineGetter__("roomId", function(){ return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i; });
this.__defineGetter__("message", function(){ return /^[a-zA-Z0-9 ]{1,40}$/; });
this.__defineGetter__("progress", function(){ return "number"; });
this.__defineGetter__("slideNotes", function(){ return new Optional("string"); });
this.__defineGetter__("validator", function() {
	return function (object, mandatory) {
		var valid = true;

		// Check if all mandatory fields are included
		if (mandatory) {
			if (!mandatory.every(function (field) {
				return typeof object[field] !== 'undefined';
			})) {
				return;
			}
		}
		for (var key in object) {
			if (object.hasOwnProperty(key)) {
				var validation = this[key];
				var optional = false;
				if (validation instanceof Optional) {
					validation = validation.value;

					if (object[key] === undefined || object[key] === null) {
						break;
					}
				}

				if (!validation) {
					valid = false;
					break;
				}

				if (typeof validation === "string") {
					if (typeof object[key] !== validation) {
						valid = false;
						break;
					}
				}

				else if (validation instanceof RegExp) {
					if (!validation.test(object[key])) {
						valid = false;
						break;
					}
				}

				else {
					valid = false;
					break;
				}
			}
		}

		return valid;
	};
});