ReactableState = React.createClass({

  propTypes: ReactableConfigShape,

  getInitialState () {
    return {
      sort:     this.getInitialSortState(),
      paginate: this.getInitialPaginationState(),
    };

    return state;
  },

  render () {

    let props = { ...this.props };
    delete props.children;

    props.sort = this.state.sort;

    if (this.state.paginate) {
      props.paginate      = this.state.paginate;
      props.onChangePage  = this.onChangePage;
      props.onChangeLimit = this.onChangeLimit;
    }

    props.onHeadCellClick = this.onHeadCellClick;

    return (
      <ReactableData { ...props }/>
    );
  },

  getInitialSortState () {
    let sort = null;

    this.props.fields.some(field => {
      if (typeof field.sort !== 'object') return false;
      if (!field.sort.default)            return false;
      sort = {
        name:      field.name,
        direction: field.sort.direction || 1,
        custom:    field.sort.custom    || null,
      };
      return true;
    });

    return sort;
  },

  getInitialPaginationState () {
    let state = null;
    if (this.props.paginate) {
      state = {
        page:   this.props.paginate.defaultPage || 1,
        limit:  this.props.paginate.defaultLimit,
      };
      if (this.props.paginate.ui) {
        state.ui = this.props.paginate.ui;
      }
    }
    return state;
  },

  onChangePage (num) {
    num = parseInt(num);
    if (isNaN(num) || num < 1) num = 1;

    let paginate = { ...this.state.paginate };
    paginate.page = num;
    this.setState({ paginate });
  },

  onChangeLimit (num) {
    num = parseInt(num);
    if (isNaN(num) || num < 1) num = 1;

    let paginate = { ...this.state.paginate };

    /**
     * When we change the limit, do some magic to recalculate the page
     * number we're viewing too so that the top row on the old page
     * still exists somewhere on the new page.
     */
    let top_row    = ((paginate.limit * (paginate.page - 1)) + 1);
    paginate.page  = Math.ceil(top_row / num);
    paginate.limit = num;

    this.setState({ paginate });
  },

  onHeadCellClick (column) {
    const field = this.props.fields[ column ];

    if (!field.sort) return;

    let sort_spec = field.sort;
    let sort      = this.state.sort || {};

    if (sort.column === column) {
      sort.direction *= -1;
    } else {
      sort.column    = column;
      sort.name      = field.name;
      sort.direction = sort_spec.direction || 1;
      sort.custom    = sort_spec.custom    || null;
      sort.transform = sort_spec.transform;
    }

    this.setState({ sort });
  },

});
