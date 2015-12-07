/**
 * This component handles subscriptions and fetching data
 */

ReactableData = React.createClass({

  mixins: [ ReactMeteorData ],

  getMeteorData () {
    const source     = this.props.source;
    const collection = source.collection;

    if (!this.props.isReactive) return {};

    let mongoSorting = false;
    if (this.props.sort) {
      const field = this.props.fields[ this.props.sort.column ];

      mongoSorting = true;
      if (field.sort.custom) {
        mongoSorting = false;
      } else if (field.sort.transform) {
        mongoSorting = false;
      } else if (typeof field.name !== 'string') {
        mongoSorting = false;
      }
    }

    let data = {
      ready: this.subscribe().ready(),
    };

    const selector = this.selector();

    if (mongoSorting && this.props.paginate) {
      data.totalRows = collection.find(selector).count();
    }

    let options = this.options({ totalRows: data.totalRows });
    if (!mongoSorting) {
      delete options.sort;
      delete options.skip;
      delete options.limit;
    }

    data.rows = collection.find(selector, options).fetch();

    if (!mongoSorting) {
      data.totalRows = data.rows.length;
      data.rows = this.sort(data.rows);
      data.rows = this.paginate(data.rows);
    }

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

        paginate.pages   = this.maxPage(paginate.limit, paginate.totalRows);
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
  options ({ totalRows }) {
    let options = {
      fields: this.fields(),
    };

    if (this.props.sort) {
      const { direction, column } = this.props.sort;
      const field = this.props.fields[ column ];
      if (field && field.name) {
        let sort = {};
        sort[ field.name ] = direction;
        options.sort = sort;
      }
    }

    if (this.props.paginate) {
      let { limit, page } = this.props.paginate;

      if (typeof totalRows !== 'undefined') {
        const maxPage = this.maxPage(limit, totalRows);
        if (page > maxPage) page = maxPage;
      }

      options.limit = limit;
      options.skip  = limit * ( page - 1 );
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
   * Returns max page number for pagination
   * @param  {number} limit     Pagination limit
   * @param  {number} totalRows Total number of rows
   * @return {number}           Max page number
   */
  maxPage (limit, totalRows) {
    return Math.max(Math.ceil(totalRows / limit), 1);
  },

  /**
   * Client side sorting. Triggered for non-reactive data sources
   * and reactive data sources with a custom sorting function
   */
  sort (rows) {
    if (!this.props.sort) return rows;

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
    if (!this.props.paginate) return rows;
    const spec  = this.props.paginate;
    const limit = spec.limit;
    const page  = Math.min(spec.page, this.maxPage(limit, rows.length));
    return rows.splice(limit * ( page - 1 ), limit);
  },

});
