;(function(root) {
	'use strict';

	var namespace = {};

	@@event-api-registry

	@@event-api

	@@event-api-connection-coordinator

	if ((typeof exports === 'object') && module) {
		module.exports = namespace; // CommonJS
	} else if ((typeof define === 'function') && define.amd) {
		define(function() {
			return namespace;
		}); // AMD
	} else {
		root.eventApi = namespace; // Browser
	}
}(this));