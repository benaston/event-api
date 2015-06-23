'use strict';

var root = (window || global).eventApi;
var EventApi = root.EventApi;
var Api1 = root.Api1;

describe('Api1', function() {
	var _api = null;
	var _objectInApi1Mock = null;

	beforeEach(function() {
		_objectInApi1Mock = {
			onErrorFromApi2: function() {}
		};
		_api = new Api1(_objectInApi1Mock);
	});

	it('should have EventApi on the prototype', function() {
		//arrange & act & assert
		expect(_api instanceof EventApi).toBe(true);
	});

	describe('constructor', function() {
		it('should throw an exception if argument `objectInApi1` is null or undefined', function() {
			[null, undefined].map(function(testCase) {
				//arrange && act & assert
				expect(function() {
					new Api1(testCase);
				}).toThrow('objectInApi1 not supplied.');
			});
		});
	});

	describe('onErrorFromApi2', function() {
		it('should invoke onErrorFromApi2 on the supplied objectFromApi1', function() {
			//arrange
			var spy = spyOn(_objectInApi1Mock, 'onErrorFromApi2');

			//act
			_api.onErrorFromApi2();

			//assert
			expect(spy.calls.count()).toBe(1);
		});
	});
});