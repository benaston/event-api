;(function(namespace) {
	'use strict';

	/**
	 * Coordinates the running of connect-commands to wire-up APIs
	 * and controls the loading and unloading of APIs at runtime.

	 * @param {Array} connectCommands - An array containing all
	 * the commands used to wire-up all the different possible types
	 * of API. Each command should have an `subjectApiName` property
	 * corresponding to the constructor name of the associated API, and
	 * a `run()` method.
	 * @param {Object} apiRegistry - An object literal within which references to the the currently loaded APIs can be help.
	 * @param {Object} options - A property on this literal named `initialApisToLoad`
	 * may be supplied to indicate which APIs to load when the coordinator is
	 * instantiated.
	 * @constructor
	 */
	function EventApiConnectionCoordinator(connectCommands, apiRegistry, options) {
		if (connectCommands == null || !connectCommands.length) {
			throw 'connectCommands not supplied.';
		}
		if (apiRegistry == null) {
			throw 'apiRegistry not supplied.';
		}

		options = options || {};
		options.initialApisToLoad = options.initialApisToLoad || [];

		this.connectCommands = connectCommands.reduce(function(prev, curr) {
			if (curr.subjectApiName == null) {
				throw 'connectCommand missing subjectApiName.';
			}

			prev[curr.subjectApiName] = curr;
			return prev;
		}, {});

		//Create maps from the supplied arrays for faster indexing.
		this.apiRegistry = apiRegistry = options.initialApisToLoad.reduce(function(prev, curr) {
			if (!curr.constructor.name) {
				throw 'Required api.constructor.name property is empty.';
			}
			prev[curr.constructor.name] = curr;
			return prev;
		}, {});

		Object.getOwnPropertyNames(this.apiRegistry).forEach(function(key) {
			var cmd = this.connectCommands[key];
			if (cmd) {
				cmd.run(this.apiRegistry);
			}
		}.bind(this));
	}

	EventApiConnectionCoordinator.prototype.apis = {};

	EventApiConnectionCoordinator.prototype.connectCommands = {};

	/**
	 * Wires-up an API into the application so that it
	 * can send to and receive events from the wider application.
	 * @param {EventApi} api - The API instance to load.
	 */
	EventApiConnectionCoordinator.prototype.loadApi = function(api) {
		if (api == null) {
			throw 'api not supplied.';
		}
		if (!api.constructor.name) {
			throw 'Required api.constructor.name property is empty.';
		}

		var apiName = api.constructor.name;

		//Add to the APIs collection.
		this.apiRegistry[apiName] = api;

		//Run any connect commands for the api that can be run given the loaded APIs.
		var connectCmd = this.connectCommands[apiName];
		if (connectCmd) {
			connectCmd.run(this.apiRegistry);
		}

		//Re-run any connect commands that use this new API.
		Object.getOwnPropertyNames(this.connectCommands)
			.forEach(function(currentCommandName) {
				var currentCommand = this.connectCommands[currentCommandName];
				if (currentCommand.subjectApiName === api.constructor.name) {
					return;
				}

				if ((currentCommand.objectApiNames || []).some(function(i) {
						return i === apiName;
					})) {
					if (this.apiRegistry[currentCommand.subjectApiName]) {
						//Only run the command if the associated API is loaded.
						currentCommand.run(this.apiRegistry);
					}
				}
			}.bind(this));
	};

	/**
	 * Removes an API from the application so that it
	 * can no longer receive events and may be garbage collected.
	 * @param {String} apiName - The name of the API to unload.
	 */
	EventApiConnectionCoordinator.prototype.unloadApi = function(apiName) {
		if (apiName == null || apiName === '') {
			throw "apiName not supplied."
		}
		if (this.apiRegistry[apiName] == null) {
			return;
		}

		Object.getOwnPropertyNames(this.apiRegistry)
			.forEach(function(currentApiName) {
				var currentApi = this.apiRegistry[currentApiName];
				if (currentApi.subscribers) {
					Object.getOwnPropertyNames(currentApi.subscribers)
						.forEach(function(eventName) {
							currentApi.subscribers[eventName] =
								(currentApi.subscribers[eventName].filter(function(subscriber) {
									return subscriber.name !== apiName;
								}));
						});
				}
			}.bind(this));

		delete this.apiRegistry[apiName];
	};

	namespace.EventApiConnectionCoordinator = EventApiConnectionCoordinator;
}(namespace));