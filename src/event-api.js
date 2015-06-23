;(function(namespace) {
	'use strict';

	/**
	 * Represents an API that publishes events and supports
	 * registration of subscribers, or, more generally: an
	 * interface between two software components that you
	 * want loosely-coupled.
	 * An instance of this constructor function should
	 * form the prototype of each sub-type.
	 * @constructor
	 */
	function EventApi() {}

	/**
	 * An 'enumeration' (i.e. a simple object map) of the
	 * events that this API can raise.
	 * This approach keeps your code DRY.
	 */
	EventApi.prototype.events = {};

	/**
	 * Objects within the software component associated with this
	 * API should call this method to notify subscribers of the specified event.
	 * @param {Number} event - A member of the events enumeration.
	 */
	EventApi.prototype.publish = function(event) {
		if (event == null) {
			throw "event not supplied."
		}

		var args = Array.prototype.slice.call(arguments, 1); //Skip the event name

		this.subscribers[event].forEach(function(s) {
			s.cb.apply(this, args);
		});
	};

	/**
	 * Other APIs should register for notification of events
	 * raised by this API using this method.
	 * @param {Number} event - A member of the events enumeration.
	 */
	EventApi.prototype.on = function(event) {
		if (event == null) {
			throw "event not supplied.";
		}

		var monad1 = Object.create(null);
		/**
		 * @param {Object} subscriber - The api instance subscribing to the event.
		 */
		monad1.notify = function(subscriber) {
			if (subscriber == null) {
				throw "subscriber not supplied."
			}

			var monad2 = Object.create(null);
			/**
			 * @param {String} methodName - The name of the method on `subscriber`
			 * that will be invoked when an event is raised.
			 */
			monad2.byCalling = function(methodName) {
				if (methodName == null || methodName === '') {
					throw "methodName not supplied."
				}

				var cb = subscriber[methodName];
				if (cb === undefined) {
					throw 'methodName not present on subscriber.';
				}
				if (typeof cb !== 'function') {
					throw 'methodName not a function.';
				}


				this.subscribers = this.subscribers || {};
				this.subscribers[event] = this.subscribers[event] || [];

				if (this.subscribers[event].some(function(el) {
						return el.cb === cb;
					})) {
					return;
				}

				this.subscribers[event].push({
					name: subscriber.constructor.name,
					cb: cb
				});
			}.bind(this);

			return monad2;
		}.bind(this);

		return monad1;
	};

	namespace.EventApi = EventApi;
}(namespace));