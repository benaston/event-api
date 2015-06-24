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