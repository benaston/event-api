(function(eventApi) {

  'use strict';

  /**
   * Encapsulates the logic for wiring
   * up an instance of Api1.
   * @constructor
   */
  function Api1ConnectCommand() {
    //Required metadata for identifying the command to run given an API name.
    this.subjectApiName = 'Api1';

    //Required metadata for identifying the commands to run given an API has been loaded.
    this.objectApiNames = ['Api2'];

    this.run = function(apiRegistry) {
      var api1, api2;

      if (apiRegistry == null) {
        throw 'apiRegistry not supplied.'
      }

      api1 = apiRegistry[this.subjectApiName];
      api2 = apiRegistry[this.objectApiNames[0]];

      if (api2) { //Important conditional for the time being. Could refactor so the registry returns a meaningful null object.
        api2.on(api2.events.error)
          .notify(api1)
          .byCalling('onErrorFromApi2'); //When api2 raises an error then api1.onError is called.
      }
    };
  }

  eventApi.Api1ConnectCommand = Api1ConnectCommand;

}(eventApi));