describe('Api1', function() {

  'use strict';

  var root = (typeof window === 'object' ? window : global).eventApi;
  var eventApi = root.api;
  var Api1 = root.Api1;

  var _api, _objectInApi1Mock;

  beforeEach(function() {

    _objectInApi1Mock = {
      onErrorFromApi2: function() {}
    };

    _api = new Api1(_objectInApi1Mock);

  });

  it('should have eventApi on the prototype', function() {

    //arrange & act & assert
    expect(eventApi.isPrototypeOf(_api)).toBe(true);

  });

  describe('constructor', function() {

    it('should throw an exception if argument `objectInApi1` is null or undefined', function() {

      [null, undefined].forEach(function(testCase) {
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