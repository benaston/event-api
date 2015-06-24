describe('Api2', function() {

  'use strict';

  var root = (typeof window === 'object' ? window : global).eventApi;
  var eventApi = root.api;
  var Api2 = root.Api2;

  var _api, _objectInApi2Mock;

  beforeEach(function() {

    _objectInApi2Mock = {
      onClickFromApi1: function() {}
    };
    _api = new Api2(_objectInApi2Mock);

  });

  it('should have eventApi on the prototype', function() {

    //arrange & act & assert
    expect(eventApi.isPrototypeOf(_api)).toBe(true);

  });

  describe('constructor', function() {

    it('should throw an exception if argument `objectInApi2` is null or undefined', function() {

      [null, undefined].forEach(function(testCase) {
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