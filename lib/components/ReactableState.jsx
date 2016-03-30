ReactableState = React.createClass({

  propTypes: ReactableConfigShape,

  mixins: [ ReactMeteorData ],

  getDefaultProps () {
    return {
      stateManager: DefaultStateManager,
    };
  },

  getInitialState () {
    let state = {
      stateManager: this.props.stateManager(),
    };
    if (state.stateManager.track) {
      state.stateDependency = new Tracker.Dependency();
    }
    return state;
  },

  getMeteorData () {
    if (this.state.stateDependency) {
      this.state.stateDependency.depend();
    }
    return {};
  },

  render () {
    let props = { ...this.props };
    delete props.children;
    delete props.stateManager;

    props.sort = this.getSort() || this.defaultSort();
    if (this.props.paginate) {
      props.paginate = {
        limit: this.getLimit() || this.props.paginate.defaultLimit,
        page:  this.getPage()  || this.props.paginate.defaultPage || 1,
        defaultLimit:   this.props.paginate.defaultLimit,
        serverSide:     this.props.paginate.serverSide,
        serverSideArgs: this.props.paginate.serverSideArgs,
      };
      if (this.props.paginate.ui) {
        props.paginate.ui = this.props.paginate.ui;
      }
      props.onChangePage  = this.onChangePage;
      props.onChangeLimit = this.onChangeLimit;
    };

    props.onHeadCellClick = this.onHeadCellClick;

    return (
      <ReactableData { ...props }/>
    );
  },

  defaultSort () {
    let defaultSort   = null;
    let firstSortable = null;

    let column = -1;
    this.props.fields.some(field => {
      ++column;

      if (firstSortable === null && field.sort) {
        const direction = typeof field.sort === 'object' ? field.sort.direction : field.sort;
        firstSortable = { column, direction };
      }

      if (typeof field.sort !== 'object') return false;
      if (!field.sort.default)            return false;
      sort = {
        column:    column,
        direction: field.sort.direction || 1,
      };
      return true;
    });
    return sort || firstSortable;
  },

  get (k) {
    return this.state.stateManager.get.call(this, k);
  },

  set (k, v) {
    this.state.stateManager.set.call(this, k, v);
    if (this.state.stateDependency) {
      this.state.stateDependency.changed();
    }
  },

  del (k) {
    this.state.stateManager.del.call(this, k);
    if (this.state.stateDependency) {
      this.state.stateDependency.changed();
    }
  },

  getLimit() {
    let limit = parseInt(this.get('l'));
    limit = isNaN(limit) ? this.props.paginate.limit : limit;
    return limit && limit > 0 ? limit : null;
  },

  setLimit (limit) {
    if (!this.props.paginate) return;
    limit = parseInt(limit);
    if (!isNaN(limit) && limit > 0) {
      if (limit === this.props.paginate.defaultLimit) {
        this.del('l');
      } else {
        this.set('l', limit);
      }
    }
  },

  getPage() {
    let page = parseInt(this.get('p'));
    page = isNaN(page) ? this.props.paginate.page : page;
    return page && page > 0 ? page : null;
  },

  setPage (page) {
    if (!this.props.paginate) return;
    page = parseInt(page);
    if (!isNaN(page) && page > 0) {
      if (page === this.props.paginate.defaultPage) {
        this.del('p');
      } else {
        this.set('p', page);
      }
    }
  },

  getSort () {
    const sort = this.get('s');
    if (typeof sort !== 'string') return null;
    const matcher = sort.match(/^([0-9])+_(-?1)$/);
    if (!matcher) return null;

    const column    = parseInt(matcher[1]);
    const direction = parseInt(matcher[2]);
    if (column >= this.props.fields.length) return null;
    if (!this.props.fields[ column ].sort) return null;

    return { column, direction }
  },

  setSort (sort) {
    this.set('s', sort.column + '_' + sort.direction);
  },

  onChangePage (num) {
    num = parseInt(num);
    if (isNaN(num) || num < 1) num = 1;
    this.setPage(num);
  },

  onChangeLimit (limit) {
    limit = parseInt(limit);
    if (isNaN(limit) || limit < 1) limit = 1;

    /**
     * When we change the limit, do some magic to recalculate the page
     * number we're viewing too so that the top row on the old page
     * still exists somewhere on the new page.
     */
    let page       = this.getPage();
    let top_row    = ((limit * (page - 1)) + 1);

    let newPage = Math.ceil(top_row / limit);
    this.setLimit(limit);
    if (newPage !== page) {
      this.setPage(newPage);
    }
  },

  onHeadCellClick (column) {
    const field = this.props.fields[ column ];

    if (!field.sort) return;

    let sort_spec = field.sort;
    let sort      = this.getSort() || this.defaultSort();

    if (sort.column === column) {
      sort.direction *= -1;
    } else {
      sort.column    = column;
      sort.direction = sort_spec.direction || 1;
    }

    this.setSort(sort);
  },

});
