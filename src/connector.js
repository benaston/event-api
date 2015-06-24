;(function(namespace) {

  'use strict';

  /**
   * Coordinates the running of connect-commands to wire-up APIs
   * and controls the loading and unloading of APIs at runtime.

   * @param {Array} connectCommands - An array containing all
   * the commands used to wire-up all the different possible types
   * of API. Each command should have an `subjectApiName` property
   * corresponding to the name of the associated API, and
   * a `run()` method.
   * @param {Object} options - A property on this literal named `initialApisToLoad`
   * may be supplied to indicate which APIs to load when the coordinator is
   * instantiated.
   * @constructor
   */
  function Connector(connectCommands, options) {
    if (connectCommands == null || !connectCommands.length) {
      throw 'connectCommands not supplied.';
    }

    options = options || {};
    options.initialApisToLoad = options.initialApisToLoad || [];

    this.connectCommands = connectCommands.reduce(function(prev, curr) {
      if (curr.subjectApiName == null) {
        throw 'connectCommand missing subjectApiName.';
      }

      prev[curr.subjectApiName] = curr;
      return prev;
    }, {});

    //Create maps from the supplied arrays for faster indexing.
    this.registry = options.initialApisToLoad.reduce(function(prev, curr) {
      if (!curr.name) {
        throw 'Required api.name property is empty.';
      }
      prev[curr.name] = curr;
      return prev;
    }, {});

    Object.getOwnPropertyNames(this.registry).forEach(function(key) {
      var cmd = this.connectCommands[key];
      if (cmd) {
        cmd.run(this.registry);
      }
    }.bind(this));
  }

  Connector.prototype.apis = {};

  Connector.prototype.connectCommands = {};

  /**
   * Wires-up an API into the application so that it
   * can send to and receive events from the wider application.
   * @param {Api} api - The API instance to load.
   */
  Connector.prototype.loadApi = function(api) {
    var apiName, connectCmd;

    if (api == null) {
      throw 'api not supplied.';
    }
    if (!api.name) {
      throw 'Required api.name property is empty.';
    }

    apiName = api.name;

    //Add to the APIs collection.
    this.registry[apiName] = api;

    //Run any connect commands for the api that can be run given the loaded APIs.
    connectCmd = this.connectCommands[apiName];
    if (connectCmd) {
      connectCmd.run(this.registry);
    }

    //Re-run any connect commands that use this new API.
    Object.getOwnPropertyNames(this.connectCommands)
      .forEach(function(currentCommandName) {
        var currentCommand = this.connectCommands[currentCommandName];
        if (currentCommand.subjectApiName === apiName) {
          return;
        }

        if ((currentCommand.objectApiNames || []).some(function(i) {
            return i === apiName;
          })) {
          if (this.registry[currentCommand.subjectApiName]) {
            //Only run the command if the associated API is loaded.
            currentCommand.run(this.registry);
          }
        }
      }.bind(this));
  };

  /**
   * Removes an API from the application so that it
   * can no longer receive events and may be garbage collected.
   * @param {String} apiName - The name of the API to unload.
   */
  Connector.prototype.unloadApi = function(apiName) {
    if (apiName == null || apiName === '') {
      throw "apiName not supplied."
    }
    if (this.registry[apiName] == null) {
      return;
    }

    Object.getOwnPropertyNames(this.registry)
      .forEach(function(currentApiName) {
        var currentApi = this.registry[currentApiName];
        if (currentApi.subscribers) {
          Object.getOwnPropertyNames(currentApi.subscribers)
            .forEach(function(eventName) {
              currentApi.subscribers[eventName] =
                (currentApi.subscribers[eventName].filter(function(subscriber) {
                  return subscriber.name !== apiName;
                }));
            });
        }
      }.bind(this));

    delete this.registry[apiName];
  };

  namespace.Connector = Connector;

}(namespace));