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

    if (res.options) {
      options = { ...options, ...res.options };
    }

    // Keep a count of the total number of matching rows for pargination
    // purposes
    const statHandle = () => {
      let count = 0;
      let initializing = true;
      const handle = collection.find(selector, { fields: { _id: 1 } }).observeChanges({
        added: () => {
          ++count;
          if (!initializing) this.changed(stats_name, 'stats', { count });
        },
        removed: () => {
          --count;
          if (!initializing) this.changed(stats_name, 'stats', { count });
        }
      });
      this.added(stats_name, 'stats', { count });
      initializing = false;
      return handle;
    }();

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
