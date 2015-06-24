(function(eventApi) {

  'use strict';

  /**
   * An example constructor function residing 'behind' `Api1`.
   * @constructor
   */
  function ConstructorInApi1(api1) {
    this.click = function(foo, bar) {
      api1.emit(api1.events.click, foo, bar);
    };

    this.onErrorFromApi2 = function() {
      console.log('ConstructorInApi1::onErrorFromApi2 triggered.');
    };
  }

  eventApi.ConstructorInApi1 = ConstructorInApi1;

}(eventApi));