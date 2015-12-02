/**
 * This component handles subscriptions and fetching data
 */

ReactableData = React.createClass({

  mixins: [ ReactMeteorData ],

  getMeteorData () {
    const source     = this.props.source;
    const collection = source.collection;

    let data = {
      ready: null,
      rows:  null,
    };

    if (Array.isArray(collection)) {
      data.ready = true;
      data.rows = (id) => {
        const fields = this.fields();
        return collection.map(doc => {
          Object.keys(doc).forEach(k => {
            if (!fields.hasOwnProperty(k)) delete doc[ k ];
          });
          if (!doc.hasOwnProperty('_id')) doc._id = ++id;
          return doc;
        });
      }(0);

      if (this.props.sort) {
        const name = this.props.sort.name;
        data.rows = data.rows.sort((a,b) => a[ name ] > b[ name ]);
        if (this.props.sort.direction < 0) {
          data.rows = data.rows.reverse();
        }
      }
    } else {
      data.ready = this.subscribe().ready();
      data.rows  = collection.find(this.selector(), this.options()).fetch();
    }

    return data;
  },

  render () {

    // Pass-through all props and reactive data as props, except for
    // props.source which is not needed outside of this component.
    let props = { ...this.props };
    delete props.children;
    delete props.source;
    Object.keys(this.data).forEach(k => props[ k ] = this.data[ k ]);

    return <ReactableUI {...props}/>;
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
      if (typeof args === 'function') {
        args = args.call(this);
      }
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
    let options = {
      fields: this.fields(),
    };

    if (this.props.sort) {
      let sort = {};
      sort[ this.props.sort.name ] = this.props.sort.direction;
      options.sort = sort;
    }

    return options;
  },

  fields () {
    let fields = this.props.fields.reduce((obj, field) => {
      if (field.hasOwnProperty('name')) obj[ field.name ] = 1;
      return obj;
    }, {});
    if (this.props.source.hasOwnProperty('fields')) {
      this.props.source.fields.forEach(field => fields[ field ] = 1);
    }
    return fields;
  }
});
