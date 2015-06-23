(function(eventApi) {
	'use strict';

	/**
	 * Example API 2. Raises example 'error' events.
	 * Has a handler for 'click' events, but knows
	 * nothing about example API 1.
	 * @constructor
	 */
	function Api2(objectInApi2) {
		if (!(this instanceof Api2)) {
			return new Api1(objectInApi2);
		}
		if (objectInApi2 == null) {
			throw 'objectInApi2 not supplied.';
		}

		this.objectInApi2 = objectInApi2;
	}

	Api2.prototype = new eventApi.EventApi();

	Api2.prototype.constructor = Api2;

	Api2.prototype.events = {
		error: 1
	};

	Api2.prototype.onClickFromApi1 = function() {
		this.objectInApi2.onClickFromApi1();
	};

	eventApi.Api2 = Api2;

}(eventApi));