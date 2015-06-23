'use strict';

var root = typeof window === 'object' ? window : global;
var EventApi = root.eventApi.EventApi;

describe('EventApi', function() {
	var _api = null;

	describe('publish', function() {

		beforeEach(function() {
			function MyApi() {
				this.subscribers = {};
			}

			MyApi.prototype = new EventApi();
			_api = new MyApi();
		});

		it('should throw an exception if argument `event` is null', function() {
			//arrange && act & assert
			expect(function() {
				_api.publish(null);
			}).toThrow('event not supplied.');
		});

		it('should invoke the callbacks subscribed to the event with the arguments supplied by the event-publisher', function() {
			//arrange
			var apiStub1 = {
				method: function(param1, param2) {}
			};
			var apiStub2 = {
				method: function(param1, param2) {}
			};
			var spy1 = spyOn(apiStub1, 'method');
			var spy2 = spyOn(apiStub2, 'method');
			var event = 1;
			_api.subscribers[event] = [{
				cb: apiStub1.method
			}, {
				cb: apiStub2.method
			}];

			//act
			_api.publish(event, 'foo', 1);

			//assert
			expect(spy1.calls.count()).toBe(1);
			expect(spy2.calls.count()).toBe(1);
			expect(spy1.calls.first().args[0]).toBe('foo');
			expect(spy1.calls.first().args[1]).toBe(1);
		});
	});

	describe('on', function() {

		beforeEach(function() {
			function MyApi() {
				this.subscribers = {};
			}

			MyApi.prototype = new EventApi();
			_api = new MyApi();
		});

		it('should throw an exception if argument `event` is null', function() {
			//arrange && act & assert
			expect(function() {
				_api.on(null);
			}).toThrow('event not supplied.');
		});

		describe('notify', function() {
			it('should throw an exception if argument `subscriber` is missing', function() {
				//arrange && act & assert
				[undefined, null].map(function(testCase) {
					expect(function() {
						_api.on('event')
							.notify(testCase);
					}).toThrow('subscriber not supplied.');
				});
			});

			describe('byCalling', function() {

				it('should throw an exception if argument `methodName` is missing', function() {
					//arrange && act & assert
					[undefined, null, ''].map(function(testCase) {
						expect(function() {
							_api.on('event')
								.notify({})
								.byCalling(testCase);
						}).toThrow('methodName not supplied.');
					});
				});

				it('should add a subscriber to the subscribers object', function() {
					//arrange
					var apiStub = {
						method: function() {}
					};
					var eventName = 'event1';

					//act
					_api.on(eventName)
						.notify(apiStub)
						.byCalling('method');

					//assert
					expect(_api.subscribers[eventName].length).toBe(1);
				});

				it('should not add a subscriber to the subscribers object if ' +
					'the subscriber is already subscribed to the event' +
					'in order to avoid duplicate events',
					function() {
						//arrange
						var apiStub = {
							method: function() {}
						};
						var eventName = 'event';
						_api.subscribers[eventName] = [{
							cb: apiStub.method
						}];

						//act
						_api.on(eventName)
							.notify(apiStub)
							.byCalling('method');

						//assert
						expect(_api.subscribers[eventName].length).toBe(1);
					});

			});
		});
	});
});