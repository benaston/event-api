describe('api', function() {

  'use strict';

  var root = (typeof window === 'object' ? window : global).eventApi;
  var api = root.api;

  var myApi;

  describe('emit', function() {

    beforeEach(function() {

      function MyApi() {
        this.subscribers = {};
      }

      MyApi.prototype = Object.create(api);
      myApi = new MyApi();

    });

    it('should throw an exception if argument `event` is null', function() {

      //arrange && act & assert
      expect(function() {
        myApi.emit(null);
      }).toThrow('event not supplied.');

    });

    it('should invoke the callbacks subscribed to the event with the arguments supplied by the event-emiter', function() {

      //arrange
      var apiStub1, apiStub2, spy1, spy2, event;

      apiStub1 = {
        method: function(param1, param2) {}
      };
      apiStub2 = {
        method: function(param1, param2) {}
      };

      spy1 = spyOn(apiStub1, 'method');
      spy2 = spyOn(apiStub2, 'method');
      event = 1;

      myApi.subscribers[event] = [{
        cb: apiStub1.method
      }, {
        cb: apiStub2.method
      }];

      //act
      myApi.emit(event, 'foo', 1);

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

      MyApi.prototype = Object.create(api);
      myApi = new MyApi();

    });

    it('should throw an exception if argument `event` is null', function() {

      //arrange && act & assert
      expect(function() {
        myApi.on(null);
      }).toThrow('event not supplied.');

    });

    describe('notify', function() {

      it('should throw an exception if argument `subscriber` is missing', function() {

        //arrange && act & assert
        [undefined, null].forEach(function(testCase) {
          expect(function() {
            myApi.on('event')
              .notify(testCase);
          }).toThrow('subscriber not supplied.');
        });

      });

      describe('byCalling', function() {

        it('should throw an exception if argument `methodName` is missing', function() {

          //arrange && act & assert
          [undefined, null, ''].forEach(function(testCase) {
            expect(function() {
              myApi.on('event')
                .notify({})
                .byCalling(testCase);
            }).toThrow('methodName not supplied.');
          });

        });

        it('should add a subscriber to the subscribers object', function() {

          //arrange
          var apiStub, eventName;

          apiStub = {
            method: function() {}
          };
          eventName = 'event1';

          //act
          myApi.on(eventName)
            .notify(apiStub)
            .byCalling('method');

          //assert
          expect(myApi.subscribers[eventName].length).toBe(1);

        });

        it('should not add a subscriber to the subscribers object if ' +
          'the subscriber is already subscribed to the event' +
          'in order to avoid duplicate events',
          function() {

            //arrange
            var apiStub, eventName;

            apiStub = {
              method: function() {}
            };
            eventName = 'event';
            myApi.subscribers[eventName] = [{
              cb: apiStub.method
            }];

            //act
            myApi.on(eventName)
              .notify(apiStub)
              .byCalling('method');

            //assert
            expect(myApi.subscribers[eventName].length).toBe(1);

          });

      });
    });

  });

});