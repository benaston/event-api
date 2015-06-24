(function(eventApi) {

  'use strict';

  /**
   * Example API 1. Raises example 'click' events.
   * Has a handler for 'error' events, but knows
   * nothing about example API 2.
   * @constructor
   */
  function Api1(objectInApi1) {
    if (objectInApi1 == null) {
      throw 'objectInApi1 not supplied.';
    }

    this.objectInApi1 = objectInApi1;
  }

  Api1.prototype = Object.create(eventApi.api);

  Api1.prototype.name = 'Api1';

  Api1.prototype.events = {
    click: 1
  };

  Api1.prototype.onErrorFromApi2 = function() {
    this.objectInApi1.onErrorFromApi2();
  };

  eventApi.Api1 = Api1;

}(eventApi));