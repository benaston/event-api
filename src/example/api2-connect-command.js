(function(eventApi) {

  'use strict';

  /**
   * Encapsulates the logic for wiring
   * up an instance of Api2.
   * @constructor
   */
  function Api2ConnectCommand() {
    //Required metadata for identifying the command to run given an API name.
    this.subjectApiName = 'Api2';

    //Required metadata for identifying the commands to run given an API has been loaded.
    this.objectApiNames = ['Api1'];

    this.run = function(apiRegistry) {
      var api1, api2;

      if (apiRegistry == null) {
        throw 'apiRegistry not supplied.'
      }

      api1 = apiRegistry[this.objectApiNames[0]];
      api2 = apiRegistry[this.subjectApiName];

      if (api1) { //Important conditional for the time being. Could refactor so the registry returns a meaningful null object.
        api1.on(api1.events.click)
          .notify(api2)
          .byCalling('onClickFromApi1'); //When api1 raises a click then api2.onClick is called.
      }
    };
  }

  eventApi.Api2ConnectCommand = Api2ConnectCommand;

}(eventApi));