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
      props.paginate            = this.state.paginate;
      props.paginate.serverSide = this.props.paginate.serverSide,
      props.onChangePage        = this.onChangePage;
      props.onChangeLimit       = this.onChangeLimit;
    }

    props.onHeadCellClick = this.onHeadCellClick;

    return (
      <ReactableData { ...props }/>
    );
  },

  getInitialSortState () {
    let defaultSort = null;
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

  getInitialPaginationState () {
    let state = null;
    if (this.props.paginate) {
      state = {
        page:  this.props.paginate.defaultPage || 1,
        limit: this.props.paginate.defaultLimit,
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
      sort.direction = sort_spec.direction || 1;
    }

    this.setState({ sort });
  },

});
