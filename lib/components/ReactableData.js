import React, { PropTypes as T } from 'react';

/**
 * This component handles subscriptions and fetching data
 */

ReactableData = React.createClass({

  mixins: [ ReactMeteorData ],

  getMeteorData () {
    const source     = this.props.source;
    const collection = source.collection;

    let data = {};

    if (!this._onStopVar) {
      this._onStopVar = new ReactiveVar(null);
    }
    const stopped = this._onStopVar.get();
    if (stopped) data.subscribeStopped = stopped;

    if (source.hasOwnProperty('ready')) {
      data.ready = source.ready.get();
    }

    if (!this.props.isReactive) return data;

    (sub => {
      if (!data.hasOwnProperty('ready')) {
        data.ready = sub.ready();
      }
    })(this.subscribe());

    if (data.ready && data.subscribeStopped) {
      delete data.subscribeStopped;
      this._onStopVar.set(null);
    }

    let statsCollection = this.serverSidePagination();

    let selector = this.selector();

    /**
     * If selector changes, skip to page 1
     */
    if (this.props.onChangePaginate) {
      if (this._sel && !EJSON.equals(this._sel, selector)) {
        if (this.props.paginate.page !== 1) {
          this.props.onChangePaginate({ page: 1 });
        }
      }
      this._sel = EJSON.clone(selector);
    }

    if (statsCollection) {
      const stats = statsCollection.findOne({ _id: 'stats' });
      if (stats) {
        data.totalRows = stats.count;
        let { skip, limit } = this.props.paginate;
        if (stats.count <= skip) {
          skip = parseInt(stats.count / limit) * limit;
          if (skip === stats.count) skip -= limit;
          this.props.onChangePaginate({ page: skip / limit });
        }
      }
    } else {
      data.totalRows = collection.find(selector).count();
    }
    data.rows = collection.find(selector, this.queryOptions(data.totalRows)).fetch();
    data.rows = this.sort(data.rows);
    data.rows = this.paginate(data.rows, data.totalRows);
    if (data.rows.length) data.ready = true;

    return data;
  },

  getData () {
    const source     = this.props.source;
    const collection = source.collection;

    if (this.props.isReactive) {
      return this.data;
    }

    let data = {
      ready: this.data.hasOwnProperty('ready') ? this.data.ready : true,
      totalRows: collection.length,
    };

    // Add fake _id's if they don't already exist
    data.rows = (id => {
      return collection.map(doc => {
        if (!doc.hasOwnProperty('_id')) doc._id = ++id;
        return doc;
      });
    })(0);

    data.rows = this.sort(data.rows);
    data.rows = this.paginate(data.rows);

    return data;
  },

  render () {
    const data = this.getData();

    // Pass-through all props and reactive data as props, except for
    // props.source which is not needed outside of this component.
    let props = { ...this.props, ...this.data };
    delete props.children;
    delete props.source;

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

    let additionalArgs = (orig, additional) => {
      return [].concat(orig).concat(additional);
    };

    if (typeof subscribe === 'object') {
      context = subscribe.context || Meteor;
      name    = subscribe.name;
      args    = subscribe.args || [];
      additionalArgs = subscribe.additionalArgs || additionalArgs;
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

    (() => {
      let arg = {
        selector: this.selector(),
        options:  this.subscribeOptions(),
      };
      if (!Array.isArray(args)) {
        args = [ args ];
      }
      args = additionalArgs(args, arg);
    })();

    return context.subscribe.call(context, name, ...args, {
      onStop: err => { err && this._onStopVar.set(true) },
    });
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
  queryOptions (totalRows) {
    let options = {
      fields: this.fields(),
    };

    if (this.querySorting()) {
      const { direction, column } = this.props.sort;
      const field = this.props.fields[ column ];
      const name = field.sort.field || field.name;
      let sort = {};
      sort[ name ] = direction;
      options.sort = sort;
    }

    if (this.queryPagination()) {
      let { limit, page } = this.props.paginate;
      if (totalRows) {
        const maxPage = Math.ceil(Math.max(totalRows,1) / limit);
        page = Math.min(page, maxPage);
      }
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
      const name = field.sort.field || field.name;
      options.sort = {};
      options.sort[ name ] = direction;
    }

    return options;
  },

  fields () {
    let fields = this.props.fields.reduce((obj, field) => {
      if (field.hasOwnProperty('name'))   obj[ field.name       ] = 1;
      if (field.sort && field.sort.field) obj[ field.sort.field ] = 1;
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

    const name = field.sort.field || field.name;

    rows = rows.sort((row1, row2) => {
      let a = row1[ name ];
      let b = row2[ name ];

      if ((field.sort.transform || !name) && field.transform) {
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
  paginate (rows, totalRows) {
    if (this.jsPagination()) {
      const spec  = this.props.paginate;
      const limit = spec.limit;
      let   page  = spec.page;

      if (totalRows) {
        const maxPage = Math.ceil(Math.max(totalRows,1) / limit);
        page = Math.min(page, maxPage);
      }

      rows = rows.splice(limit * ( page - 1 ), limit);
    } else if (this.serverSidePagination()){
      /**
       * When we do server side pagination, if the DDP adds are
       * done before the removes then the displayed table may
       * momentarily contain more data than the limit, which is a
       * jarring effect. So we perform another slice here.
       */
      rows = rows.splice(0, this.props.paginate.limit);
    }
    return rows;
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
    if (!this.props.sort)       return false;
    if (!this.props.isReactive) return false;
    const { direction, column } = this.props.sort;
    const field = this.props.fields[ column ];
    const name = field.sort.field || field.name;
    if (!name) return false;
    if (field.sort.transform) return false;
    if (field.sort.custom)    return false;
    return true;
  },

  jsSorting () {
    if (!this.props.sort) return false;
    if (!this.props.isReactive) return true;
    const { direction, column } = this.props.sort;
    const field = this.props.fields[ column ];
    const name = field.sort.field || field.name;
    return !!(!name || field.sort.transform || field.sort.custom);
  },

});
