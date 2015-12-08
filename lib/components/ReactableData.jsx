/**
 * This component handles subscriptions and fetching data
 */

ReactableData = React.createClass({

  mixins: [ ReactMeteorData ],

  getMeteorData () {
    const source     = this.props.source;
    const collection = source.collection;

    console.log('serverSidePagination', !!this.serverSidePagination());
    console.log('queryPagination',      this.queryPagination());
    console.log('jsPagination',         this.jsPagination());
    console.log('serverSideSorting',    this.serverSideSorting());
    console.log('querySorting',         this.querySorting());
    console.log('jsSorting',            this.jsSorting());

    if (!this.props.isReactive) return {};

    let data = {
      ready: this.subscribe().ready(),
    };

    let statsCollection = this.serverSidePagination();

    let selector = this.selector();

    if (statsCollection) {
      const stats = statsCollection.findOne({ _id: 'stats' });
      if (stats) data.totalRows = stats.count;
    } else {
      data.totalRows = collection.find(selector).count();
    }

    data.rows = collection.find(selector, this.queryOptions()).fetch();
    data.rows = this.sort(data.rows);
    data.rows = this.paginate(data.rows);

    return data;
  },

  getData () {
    const source     = this.props.source;
    const collection = source.collection;

    if (this.props.isReactive) {
      return this.data;
    }

    let data = {
      ready: true,
      totalRows: collection.length,
    };

    // Add fake _id's if they don't already exist
    data.rows = id => {
      return collection.map(doc => {
        if (!doc.hasOwnProperty('_id')) doc._id = ++id;
        return doc;
      });
    }(0);

    data.rows = this.sort(data.rows);
    data.rows = this.paginate(data.rows);

    return data;
  },

  render () {
    const data = this.getData();

    // Pass-through all props and reactive data as props, except for
    // props.source which is not needed outside of this component.
    let props = { ...this.props };
    delete props.children;
    delete props.source;
    Object.keys(data).forEach(k => props[ k ] = data[ k ]);

    // Pagination info
    if (props.paginate) {
      let paginate = { ...props.paginate };
      if (props.hasOwnProperty('totalRows')) {
        paginate.totalRows = props.totalRows;
        delete props.totalRows;

        paginate.pages   = Math.ceil(Math.max(paginate.totalRows,1) / paginate.limit);
        paginate.page    = Math.min(paginate.page, paginate.pages);
        paginate.hasMore = paginate.pages > paginate.page;
      } else {
        paginate.hasMore = !!data.rows.length;
      }
      props.paginate = paginate;
    }

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

    // If we've requested server side pagination, then we must have
    // control of the subscription, as we pass pagination data in the
    // arguments of a subscription
    const failIfServerSidePagination = () => {
      if (this.serverSidePagination()) {
        throw new Error("Can't use server side pagination without controlling the subscription");
      }
    };

    // Return a fake "subscription-like" object if we don't know
    // anything about the subscription
    if (typeof subscribe === 'undefined' || subscribe === null) {
      failIfServerSidePagination();
      return { ready: () => true };
    }

    // If we were passed a subscription or a function which
    // returned one, then return that.
    if (typeof subscribe === 'object' &&
        typeof subscribe.stop === 'function' &&
        typeof subscribe.ready === 'function' &&
        subscribe.hasOwnProperty('subscriptionId')
    ) {
      failIfServerSidePagination();
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

    () => {
      let arg = {
        selector: this.selector(),
        options:  this.subscribeOptions(),
      };
      if (!Array.isArray(args)) {
        args = [ args ];
      }
      args.push(arg);
    }();

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
  queryOptions () {
    let options = {
      fields: this.fields(),
    };

    if (this.querySorting()) {
      const { direction, column } = this.props.sort;
      const field = this.props.fields[ column ];
      let sort = {};
      sort[ field.name ] = direction;
      options.sort = sort;
    }

    if (this.queryPagination()) {
      let { limit, page } = this.props.paginate;
      options.limit = limit;
      options.skip  = limit * ( page - 1 );
    }

    return options;
  },

  subscribeOptions () {
    let options = {
      fields: this.fields(),
    };

    if (this.serverSidePagination()) {
      let { limit, page } = this.props.paginate;
      options.limit = limit;
      options.skip  = limit * ( page - 1 );

      const { direction, column } = this.props.sort;
      const field = this.props.fields[ column ];
      options.sort = {};
      options.sort[ field.name ] = direction;
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
  },

  /**
   * Client side sorting. Triggered for non-reactive data sources
   * and reactive data sources with a custom sorting function
   */
  sort (rows) {
    if (!this.jsSorting()) return rows;

    const { direction, column } = this.props.sort;
    const field = this.props.fields[ column ];

    rows = rows.sort((row1, row2) => {
      let a = row1[ field.name ];
      let b = row2[ field.name ];

      if ((field.sort.transform || !field.name) && field.transform) {
        a = field.transform.call({ row: row1 }, a);
        b = field.transform.call({ row: row2 }, b);
      }

      if (field.sort.custom) {
        const ctx = { row: [row1, row2] };
        return field.sort.custom.call(ctx, a, b);
      } else {
        return a > b ? 1 : a < b ? -1 : 0;
      }
    });
    if (direction === -1) rows = rows.reverse();

    return rows;
  },

  /**
   * Client side pagination. Triggered for non-reactive data sources
   * and reactive data sources with a custom sorting function
   */
  paginate (rows) {
    if (!this.jsPagination()) return rows;
    const spec  = this.props.paginate;
    const limit = spec.limit;
    const page  = spec.page;
    return rows.splice(limit * ( page - 1 ), limit);
  },

  serverSidePagination () {
    return this.props.paginate ? this.props.paginate.serverSide : null;
  },

  serverSideSorting () {
    return !!this.serverSidePagination();
  },

  queryPagination () {
    return this.props.paginate && !this.props.paginate.serverSide && this.querySorting();
  },

  jsPagination () {
    return this.props.paginate && !this.props.paginate.serverSide && this.jsSorting();
  },

  querySorting () {
    if (!this.props.sort)          return false;
    const { direction, column } = this.props.sort;
    const field = this.props.fields[ column ];
    if (!field.name)          return false;
    if (field.sort.transform) return false;
    if (field.sort.custom)    return false;
    return true;
  },

  jsSorting () {
    if (!this.props.sort) return false;
    if (!this.props.isReactive) return true;
    const { direction, column } = this.props.sort;
    const field = this.props.fields[ column ];
    return !!(!field.name || field.sort.transform || field.sort.custom);
  },

});
