// validation patterns

this.__defineGetter__("action", function(){ return /^[a-zA-Z]{1,30}$/; });
this.__defineGetter__("errorType", function(){ return /^validation|duplicate$/; });
this.__defineGetter__("magic", function(){ return /^[a-zA-Z0-9 ]{4,60}$/; });
this.__defineGetter__("message", function(){ return /^[a-zA-Z0-9 ]{1,40}$/; });
this.__defineGetter__("nickname", function(){ return /^[a-zA-Z0-9 ]{1,20}$/; });
this.__defineGetter__("progress", function(){ return "number"; });
this.__defineGetter__("slideNotes", function(){ var x = "string"; x.optional = true; return x; });
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
			if (!this[key]) {
				valid = false;
				break;
			}

			if (typeof this[key] === "string") {
				if (typeof object[key] !== this[key] && !(typeof object[key] === 'undefined' && this[key].optional)) {
					valid = false;
					break;
				}
			}

			else if (this[key] instanceof RegExp) {
				if (!this[key].test(object[key])) {
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