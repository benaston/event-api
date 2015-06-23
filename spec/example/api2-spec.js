'use strict';

var root = (window || global).eventApi;
var EventApi = root.EventApi;
var Api2 = root.Api2;

describe('Api2', function() {
	var _api = null;
	var _objectInApi2Mock = null;

	beforeEach(function() {
		_objectInApi2Mock = {
			onClickFromApi1: function() {}
		};
		_api = new Api2(_objectInApi2Mock);
	});

	it('should have EventApi on the prototype', function() {
		//arrange & act & assert
		expect(_api instanceof EventApi).toBe(true);
	});

	describe('constructor', function() {
		it('should throw an exception if argument `objectInApi2` is null or undefined', function() {
			[null, undefined].map(function(testCase) {
				//arrange && act & assert
				expect(function() {
					new Api2(testCase);
				}).toThrow('objectInApi2 not supplied.');
			});
		});
	});

	describe('onClickFromApi1', function() {
		it('should invoke onClickFromApi1 on the supplied objectFromApi2', function() {
			//arrange
			var spy = spyOn(_objectInApi2Mock, 'onClickFromApi1');

			//act
			_api.onClickFromApi1();

			//assert
			expect(spy.calls.count()).toBe(1);
		});
	});
});