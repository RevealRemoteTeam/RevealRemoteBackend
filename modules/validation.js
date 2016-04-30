function Optional (value) {
	this.value = value;
};

// validation patterns

this.__defineGetter__("action", function(){ return /^[a-zA-Z]{1,30}$/; });
this.__defineGetter__("errorType", function(){ return /^validation|duplicate$/; });
this.__defineGetter__("magic", function(){ return /^[a-zA-Z0-9 ]{4,60}$/; });
this.__defineGetter__("message", function(){ return /^[a-zA-Z0-9 ]{1,40}$/; });
this.__defineGetter__("nickname", function(){ return /^[a-zA-Z0-9 ]{1,20}$/; });
this.__defineGetter__("progress", function(){ return "number"; });
this.__defineGetter__("slideNotes", function(){ return new Optional("string"); });
this.__defineGetter__("validator", function() { return function (object, mandatory) {
	var valid = true;
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
}; })