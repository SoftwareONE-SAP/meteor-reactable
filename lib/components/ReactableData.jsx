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

      // Apply sorting
      if (this.props.sort) {
        const name = this.props.sort.name;
        data.rows = data.rows.sort((a,b) => a[ name ] > b[ name ]);
        if (this.props.sort.direction < 0) {
          data.rows = data.rows.reverse();
        }
      }

      data.totalRows = data.rows.length;

      // Apply pagination
      if (this.props.paginate) {
        let { limit, page } = this.props.paginate;

        const maxPage = this.maxPage(limit, data.totalRows);
        if (page > maxPage) page = maxPage;

        const startRow = limit * ( page - 1 );
        const endRow   = limit * page;
        let rows = [];
        for (let i = startRow; i < endRow && i < data.totalRows; ++i) {
          rows.push(data.rows[i]);
        }
        data.rows = rows;
      }

    } else {
      data.ready = this.subscribe().ready();
      if (this.props.paginate) {
        data.totalRows = collection.find(this.selector()).count();
      }
      data.rows  = collection.find(this.selector(), this.options({
        totalRows: data.totalRows
      })).fetch();
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

    // Pagination
    if (props.hasOwnProperty('totalRows')) {
      let paginate = { ...props.paginate };
      paginate.totalRows = props.totalRows;
      delete props.totalRows;

      if (paginate.totalRows === 0) {
        paginate.pages = 1;
      } else {
        paginate.pages = this.maxPage(paginate.limit, paginate.totalRows);
      }
      if (paginate.page > paginate.pages) {
        paginate.page = paginate.pages;
      }
      paginate.hasMore = paginate.pages > paginate.page;
      props.paginate   = paginate;
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
      let sort = {};
      sort[ this.props.sort.name ] = this.props.sort.direction;
      options.sort = sort;
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

    console.log(options);

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

  maxPage (limit, totalRows) {
    let pages     = totalRows / limit;
    let realPages = parseInt(pages);
    if (realPages < pages) ++realPages;
    return realPages;
  },
});
