;(function(root) {
  'use strict';

  var namespace = {};

  ;(function(namespace) {

  'use strict';

  /**
   * A hash of the currently loaded APIs. Used to enable connect
   * command to be lazy and enable reference to api objects only
   * when they are loaded.
   */
  namespace.registry = {};

}(namespace));

  ;(function(namespace) {
  'use strict';

  /**
   * Represents an API that emits events and supports
   * registration of subscribers, or, more generally: an
   * interface between two software components that you
   * want loosely-coupled.
   * An instance of this constructor function should
   * form the prototype of each sub-type.
   * @constructor
   */
  var api = {};

  /**
   * An 'enumeration' (i.e. a simple object map) of the
   * events that this API can raise.
   * This approach keeps your code DRY.
   */
  api.events = {};

  /**
   * Objects within the software component associated with this
   * API should call this method to notify subscribers of the specified event.
   * @param {Number} event - A member of the events enumeration.
   */
  api.emit = function(event) {
    var args;

    if (event == null) {
      throw 'event not supplied.'
    }

    args = Array.prototype.slice.call(arguments, 1); //Skip the event name

    if (!this.subscribers) {
      return; // Subscribers not initialized.
    }

    this.subscribers[event].forEach(function(s) {
      s.cb.apply(this, args);
    });
  };

  /**
   * Clients should register for notification of events
   * raised by this API using this method.
   * Note: there is no corresponding 'off' method. To 
   * stop communication between two components, use 
   * the `unload` method on the connector.
   * @param {Number/String} event - A member of the events enumeration.
   */
  api.on = function(event) {
    if (event == null) {
      throw 'event not supplied.';
    }

    // subscriber: The api instance subscribing to the event.
    // methodName: The name of the method on `subscriber` that will be invoked when an event is raised.
    return {
      notify: function(subscriber) {
        if (subscriber == null) {
          throw 'subscriber not supplied.';
        }

        return {
          byCalling: function(methodName) {
            if (methodName == null || methodName === '') {
              throw 'methodName not supplied.';
            }

            configureOn.call(this, event, subscriber, methodName);
          }.bind(this)
        };
      }.bind(this)
    };
  };

  function configureOn(event, subscriber, methodName) {
    var cb = subscriber[methodName];

    if (cb === undefined) {
      throw 'methodName not present on subscriber.';
    }
    if (typeof cb !== 'function') {
      throw 'methodName not a function.';
    }

    this.subscribers = this.subscribers || {};
    this.subscribers[event] = this.subscribers[event] || [];

    if (this.subscribers[event]
      .some(function(el) {
        return el.cb === cb;
      })) {
      return; // Duplicate subscription.
    }

    this.subscribers[event].push({
      name: subscriber.name,
      cb: cb
    });
  }

  namespace.api = api;
}(namespace));

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

  if ((typeof exports === 'object') && module) {
    module.exports = namespace; // CommonJS
  } else if ((typeof define === 'function') && define.amd) {
    define(function() {
      return namespace;
    }); // AMD
  } else {
    root.eventApi = namespace; // Browser
  }
}(this));