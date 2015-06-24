describe('Connector', function() {

  'use strict';

  var root = (typeof window === 'object' ? window : global).eventApi;
  var Api1 = root.Api1;
  var Api2 = root.Api2;
  var ConstructorInApi1 = root.ConstructorInApi1;
  var ConstructorInApi2 = root.ConstructorInApi2;
  var Api1ConnectCommand = root.Api1ConnectCommand;
  var Api2ConnectCommand = root.Api2ConnectCommand;
  var Connector = root.Connector;

  var _coordinator,
    _api1Mock,
    _api1ConnectCmdMock,
    _api2ConnectCmdMock;

  beforeEach(function() {

    _api1Mock = {
      name: 'Api1Mock'
    };
    _api1ConnectCmdMock = {
      run: function() {},
      subjectApiName: 'Api1Mock',
      objectApiNames: []
    };
    _api2ConnectCmdMock = {
      run: function() {},
      subjectApiName: 'Api2Mock',
      objectApiNames: []
    };
    _coordinator = new Connector(
      [_api1ConnectCmdMock, _api2ConnectCmdMock], {
        initialApisToLoad: [_api1Mock]
      });

  });

  describe('constructor', function() {

    it('should throw an exception if argument `connectCommands` is null, undefined or an empty Array', function() {

      [null, undefined, []].forEach(function(testCase) {
        //arrange && act & assert
        expect(function() {
          new Connector(testCase);
        }).toThrow('connectCommands not supplied.');
      });

    });

    it('should invoke the connectCommands zero times when no APIs are supplied (because there are no APIs to wire-up)', function() {

      //arrange
      var api1ConnectCmdMock, api2ConnectCmdMock, spy1, spy2;

      api1ConnectCmdMock = {
        run: function() {},
        subjectApiName: 'Api1Mock',
        objectApiNames: []
      };
      api2ConnectCmdMock = {
        run: function() {},
        subjectApiName: 'Api2Mock',
        objectApiNames: []
      };

      spy1 = spyOn(api1ConnectCmdMock, 'run');
      spy2 = spyOn(api2ConnectCmdMock, 'run');

      //act
      new Connector([_api1ConnectCmdMock, _api2ConnectCmdMock]);

      //assert
      expect(spy1.calls.count()).toBe(0);
      expect(spy2.calls.count()).toBe(0);

    });

    it('should invoke the appropriate connectCommand a single time if the associated API has been supplied, so that the APIs are wired-up', function() {

      //arrange
      var apiStub, api1ConnectCmdMock, api2ConnectCmdMock, spy1, spy2;

      apiStub = {
        name: 'Api1Mock'
      };
      api1ConnectCmdMock = {
        run: function() {},
        subjectApiName: 'Api1Mock',
        objectApiNames: []
      };
      api2ConnectCmdMock = {
        run: function() {},
        subjectApiName: 'Api2Mock',
        objectApiNames: []
      };
      spy1 = spyOn(api1ConnectCmdMock, 'run');
      spy2 = spyOn(api2ConnectCmdMock, 'run');

      //act
      new Connector([api1ConnectCmdMock, api2ConnectCmdMock], {
        initialApisToLoad: [apiStub]
      });

      //assert
      expect(spy1.calls.count()).toBe(1);
      expect(spy2.calls.count()).toBe(0);

    });

    it('should not throw an error if there are no connect commands associated with the supplied API', function() {

      //arrange
      var api1ConnectCmdMock, apiStub, expectedResult, result;

      api1ConnectCmdMock = {
        run: function() {},
        subjectApiName: 'Api1Mock',
        objectApiNames: []
      };
      apiStub = {
        name: 'Api2Mock'
      };

      expectedResult = 'has not thrown an exception';
      result = expectedResult;

      //act
      try {
        new Connector([api1ConnectCmdMock], {
          initialApisToLoad: [apiStub]
        });
      } catch (e) {
        result = 'threw an exception';
      }

      //assert
      expect(result).toEqual(expectedResult);

    });

  });

  describe('loadApi', function() {

    it('should throw an exception if the `api` has a name property that is null, undefined or the empty string', function() {

      //arrange
      [null, undefined, ''].map(function(testCase) {
        //arrange
        var apiMock = {
          name: testCase
        };

        //act & assert
        expect(function() {
          _coordinator.loadApi(apiMock);
        }).toThrow('Required api.name property is empty.');
      });

    });

    it('should throw an exception if the argument `api` is null or undefined', function() {

      //arrange
      [null, undefined].map(function(testCase) {
        //arrange && act & assert
        expect(function() {
          _coordinator.loadApi(testCase);
        }).toThrow('api not supplied.');
      });

    });

    it('should add the supplied api to the api collection on the coordinator so that developers can determine easily at runtime which APIs are loaded', function() {

      //arrange
      var apiStub;

      apiStub = {
        name: 'apiName'
      };

      //act
      _coordinator.loadApi(apiStub);

      //assert
      expect(_coordinator.registry['apiName']).toEqual(apiStub);

    });

    it('should run the connect-command associated with the supplied api to ensure it is wired-up to the other APIs in the application', function() {

      //arrange
      var api2Mock, spy1, spy2;

      api2Mock = {
        name: 'Api2Mock'
      };
      spy1 = spyOn(_api1ConnectCmdMock, 'run');
      spy2 = spyOn(_api2ConnectCmdMock, 'run');

      //act
      _coordinator.loadApi(api2Mock);

      //assert
      expect(spy1.calls.count()).toBe(0);
      expect(spy2.calls.count()).toBe(1);

    });

    it('should re-run the connect commands that link to the loaded API, so that they have an opportunity to subscribe to events on the newly loaded API', function() {

      //arrange
      var api1Mock, api2Mock, api3Mock, api1ConnectCmdMock,
        api2ConnectCmdMock, api3ConnectCmdMock, spy1, spy2,
        coordinator;

      api1Mock = {
        name: 'Api1Mock'
      };
      api2Mock = {
        name: 'Api2Mock'
      };
      api3Mock = {
        name: 'Api3Mock'
      };

      api1ConnectCmdMock = {
        run: function() {},
        subjectApiName: 'Api1Mock',
        objectApiNames: ['Api2Mock']
      };
      api3ConnectCmdMock = {
        run: function() {},
        subjectApiName: 'Api3Mock',
        objectApiNames: ['Api2Mock']
      };

      spy1 = spyOn(api1ConnectCmdMock, 'run');
      spy2 = spyOn(api3ConnectCmdMock, 'run');

      api2ConnectCmdMock = {
        run: function() {},
        subjectApiName: 'Api2Mock',
        objectApiNames: ['']
      };

      coordinator = new Connector(
        [api1ConnectCmdMock, api2ConnectCmdMock, api3ConnectCmdMock], {
          initialApisToLoad: [api1Mock]
        });

      //assert
      expect(spy1.calls.count()).toBe(1);

      //act
      coordinator.loadApi(api2Mock);

      //assert
      expect(spy1.calls.count()).toBe(2);
      expect(spy2.calls.count()).toBe(0); //because API3 is not loaded

      //act
      coordinator.loadApi(api3Mock);

      //assert
      expect(spy2.calls.count()).toBe(1); //because API3 is loaded

    });

    it('should not throw an error if there are no connect commands associated with the supplied API', function() {

      //arrange
      var api3Mock, expectedResult, result;

      api3Mock = {
        name: 'Api3Mock'
      };
      expectedResult = 'has not thrown an exception';
      result = expectedResult;

      //act
      try {
        _coordinator.loadApi(api3Mock);
      } catch (e) {
        result = 'threw an exception';
      }

      //assert
      expect(result).toEqual(expectedResult);

    });

  });

  describe('unloadApi', function() {

    it('should throw an exception if the argument `apiName` is null, undefined or the empty string', function() {

      //arrange
      [null, undefined, ''].map(function(testCase) {
        //arrange && act & assert
        expect(function() {
          _coordinator.unloadApi(testCase);
        }).toThrow('apiName not supplied.');
      });

    });

    //This over-size test serves as an integration test and an example.
    //I would not typically write such a huge test.
    it('should remove any subscriptions currently active for the API to be unloaded to ensure the API can be garbage collected and that future events will not cause errors', function() {

      //arrange
      var api1, api2, spy1, spy2, api1ConnectCmd,
        api2ConnectCmd, coord;

      api1 = new Api1(new ConstructorInApi1());
      debugger;
      api2 = new Api2(new ConstructorInApi2());
      spy1 = spyOn(api1, 'onErrorFromApi2');
      spy2 = spyOn(api2, 'onClickFromApi1');

      //The logic for wiring-up of the APIs is encapsulated
      //within connect-commands.
      api1ConnectCmd = new Api1ConnectCommand();
      api2ConnectCmd = new Api2ConnectCommand();

      //The Connector runs the connect commands
      //and enables APIs to be loaded and unloaded.
      coord = new Connector(
        [api1ConnectCmd, api2ConnectCmd], {
          initialApisToLoad: [api1, api2]
        });

      //assert
      expect(coord.registry['Api1']).toEqual(api1);
      expect(coord.registry['Api2']).toEqual(api2);
      expect(coord.registry['Api2'].subscribers[api2.events.error].length).toEqual(1);
      expect(spy1.calls.count()).toEqual(0);
      expect(spy2.calls.count()).toEqual(0);

      //act
      api2.emit(api2.events.error);
      api2.emit(api2.events.error);

      //assert
      expect(spy1.calls.count()).toEqual(2);
      expect(spy2.calls.count()).toEqual(0);

      //act
      coord.unloadApi('Api1');
      api2.emit(api2.events.error);
      api1.emit(api1.events.click);
      api1.emit(api1.events.click);

      //assert
      expect(spy1.calls.count()).toEqual(2);
      expect(spy2.calls.count()).toEqual(2);
      expect(coord.registry['Api1']).toEqual(undefined);
      expect(coord.registry['Api2'].subscribers[api2.events.error].length).toEqual(0);

      //act
      coord.loadApi(api1);
      api2.emit(api2.events.error);

      //assert
      expect(spy1.calls.count()).toEqual(3);

    });

    it('should support the lazy loading of APIs', function() {

      //arrange
      var api1, spy1, api1ConnectCmd, api2ConnectCmd,
        coord, api2, spy2;

      api1 = new Api1(new ConstructorInApi1());
      spy1 = spyOn(api1, 'onErrorFromApi2');

      //The logic for wiring-up of the APIs is encapsulated
      //within connect-commands.
      api1ConnectCmd = new Api1ConnectCommand();
      api2ConnectCmd = new Api2ConnectCommand();

      //The Connector runs the connect commands
      //and enables APIs to be loaded and unloaded.
      coord = new Connector(
        [api1ConnectCmd, api2ConnectCmd], {
          initialApisToLoad: [api1]
        });

      api2 = new Api2(new ConstructorInApi2());
      spy2 = spyOn(api2, 'onClickFromApi1');
      coord.loadApi(api2);

      //act
      api2.emit(api2.events.error);
      api1.emit(api1.events.click);
      api1.emit(api1.events.click);

      //assert
      expect(spy1.calls.count()).toEqual(1);
      expect(spy2.calls.count()).toEqual(2);

    });

  });
});