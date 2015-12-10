Reactable = Reactable || {};

Reactable.publish = function (name, options, func) {

  if (typeof options === 'function') {
    func    = options;
    options = {};
  }

  const col_name   = options.collection || name;
  const stats_name = options.stats      || name + '/stats';

  Meteor.publish(name, function (...args){
    let opt = args.pop();
    assertOptions(opt);
    let options  = opt.options;

    const res        = func.apply(this, args);
    const collection = res.collection;
    const selector   = res.selector || {};

    // Keep a count of the total number of matching rows for pargination
    // purposes
    let totalRows = 0;
    const statHandle = () => {
      let initializing = true;
      const handle = collection.find(selector, { fields: { _id: 1 } }).observeChanges({
        added: () => {
          ++totalRows;
          if (!initializing) this.changed(stats_name, 'stats', { count: totalRows });
        },
        removed: () => {
          --totalRows;
          if (!initializing) this.changed(stats_name, 'stats', { count: totalRows });
        }
      });
      this.added(stats_name, 'stats', { count: totalRows });
      initializing = false;
      return handle;
    }();

    if (res.options) {
      options = { ...options, ...res.options };
    }

    // If skip value is too high, then drop it to the highest
    // it is allowed to be.
    if (options.limit && options.skip) {
      const maxPage = Math.ceil(Math.max(1, totalRows) / options.limit);
      const maxSkip = (maxPage - 1) * options.limit;
      options.skip = Math.min(maxSkip, options.skip);
    }

    const dataHandle = collection.find(selector, options).observeChanges({
      added:   (id, fields) => this.added(col_name, id, fields),
      removed: (id)         => this.removed(col_name, id),
      changed: (id, fields) => this.changed(col_name, id, fields),
    });

    this.onStop(function () {
      dataHandle.stop();
      statHandle.stop();
    });

    this.ready();
  });

};

function assertOptions (opt) {

  if (typeof opt !== 'object') {
    throw new Error("Invalid options");
  }

  let options = opt.options;

  if (typeof options !== 'object') {
    throw new Error("Invalid options");
  }

  Object.keys(options).forEach(k => {
    if (k === 'limit' || k === 'skip') {
      if (typeof options[ k ] !== 'number' && options[ k ] < 0) {
        throw new Error("Invalid ''" + k + "' option");
      }
    } else if (k === 'fields' || k === 'sort') {
      if (typeof options[ k ] !== 'object') {
        throw new Error("Invalid '" + k + "' option");
      }
      Object.keys(options[ k ]).forEach(k2 => {
        const v = options[ k ][ k2 ];
        if (typeof k2 !== 'string' || v !== 1 && v !== -1) {
          throw new Error("Invalid '" + k + "' options")
        }
      });
    } else {
      throw new Error("Invalid option named '" + k + "'");
    }
  });

  // @todo opt.selector
}
