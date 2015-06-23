(function(eventApi) {
	'use strict';

	/**
	 * An example constructor function residing 'behind' `Api2`.
	 * @constructor
	 */
	function ConstructorInApi2(api2) {
		this.error = function(foo, bar, bam) {
			api2.publish(api2.events.error, foo, bar, bam);
		};

		this.onClickFromApi1 = function() {
			console.log('ConstructorInApi2::onClickFromApi1 triggered.');
		}
	}

	eventApi.ConstructorInApi2 = ConstructorInApi2;

}(eventApi));