ReactableData = React.createClass({

  mixins: [ ReactMeteorData ],

  getMeteorData () {
    const source     = this.props.source;
    const collection = source.collection;

    let data = {
      ready: true,
      rows:  collection,
    };

    if (!Array.isArray(collection)) {
      data.ready = this.subscribe().ready();
      data.rows  = collection.find(this.selector(), this.options()).fetch();
    }

    return data;
  },

  render () {
    return (
      <pre>
        { JSON.stringify(this.data) }
      </pre>
    );
  },

  /**
   * Returns the subscription. Handles actually subscribing
   * if necessary.
   */
  subscribe () {
    let subscribe = this.props.source.subscribe;

    // If passed a function, run it to get the result
    if (typeof subscribe === 'function') {
      subscribe = subscribe.call(this);
    }

    // Return a fake "subscription-like" object if we don't know
    // anything about the subscription
    if (typeof subscribe === 'undefined' || subscribe === null) {
      return { ready: () => true };
    }

    // If we were passed a subscription or a function which
    // returned one, then return that.
    if (typeof subscribe === 'object' &&
        typeof subscribe.stop === 'function' &&
        typeof subscribe.ready === 'function' &&
        subscribe.hasOwnProperty('subscriptionId')
    ) {
      return subscribe;
    }

    // If we reach here then we know we have to handle subscriptions
    // internally.

    let context, name, args;

    if (typeof subscribe === 'object') {
      context = subscribe.context || Meteor;
      name    = subscribe.name;
      args    = subscribe.args || [];
    } else if (typeof subscribe === 'string') {
      context = Meteor;
      name    = subscribe;
      args    = [];
    } else {
      throw "Bad subscribe type: " + typeof(subscribe);
    }

    return context.subscribe.call(context, name, ...args);
  },

  /**
   * Returns selector to be used in the Mongo query
   */
  selector () {
    let selector = this.props.source.selector;
    if (typeof selector === 'function') {
      selector = selector.call(this);
    }
    return selector || {};
  },

  /**
   * Returns options to be used in the Mongo query
   */
  options () {
    let options = {};

    options.fields = this.props.fields.reduce((obj, field) => {
      if (field.hasOwnProperty('name')) obj[ field.name ] = 1;
      return obj;
    }, {});

    return options;
  },

});
