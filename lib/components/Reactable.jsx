const T = React.PropTypes;

/**
 * This is the root component. It handles the configuration
 */

Reactable = React.createClass({

  propTypes: {
    id:             T.string,
    classes:        ReactableTypeClasses,
    tableClasses:   ReactableTypeClasses,
    trClasses:      ReactableTypeClasses,
    tr:             T.func, // React class
    addTbody:       T.bool,
    source:         ReactableTypeSource.isRequired,
    fields:         T.arrayOf(ReactableTypeField).isRequired,
    paginate:       T.oneOfType([
      T.number,
      T.shape({
        ui:           T.func, // React classes
        defaultPage:  T.number,
        defaultLimit: T.number.isRequired,
      }),
    ]),
  },

  getInitialState () {
    let state = {
      sort: this.getInitialSortState(),
    };

    let paginate = this.getInitialPaginationState();
    if (paginate) {
      state.paginate = paginate;
    }

    return state;
  },

  render () {

    let props = { ...this.props };
    delete props.children;

    // Field sorting fixups
    props.fields = props.fields.map(origField => {
      let field = { ...origField };
      if (typeof field.sort === 'number') {
        field.sort = { direction: field.sort };
      }
      return Reactable.applyFieldDefaults(field);
    });
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
    paginate.limit = num;
    this.setState({ paginate });
  },

  onHeadCellClick (field) {
    const name = field.name;

    let sort_spec = field.sort;
    let sort      = this.state.sort || {};

    if (sort.name === name) {
      sort.direction *= -1;
    } else {
      sort.name      = name;
      sort.direction = sort_spec.direction || 1;
    }
    this.setState({ sort });
  },

  getInitialSortState () {
    let sort = null;

    this.props.fields.some(field => {
      if (!field.hasOwnProperty('name'))  return false;
      if (typeof field.sort !== 'object') return false;
      if (!field.sort.default)            return false;
      sort = {
        name:      field.name,
        direction: field.sort.direction || 1,
      };
      return true;
    });

    return sort;
  },

  getInitialPaginationState () {
    let state = null;
    if (this.props.paginate) {
      state = {};
      if (typeof this.props.paginate === 'number') {
        state.page  = 1;
        state.limit = this.props.paginate;
      } else {
        state.page  = this.props.paginate.defaultPage || 1;
        state.limit = this.props.paginate.defaultLimit;
        if (this.props.paginate.ui) {
          state.ui = this.props.paginate.ui;
        }
      }
    }
    return state;
  },

  statics: () => {

    let fieldDefaults = [];

    return {
      setFieldDefaults (callback) {
        fieldDefaults.push(callback);
      },
      applyFieldDefaults (field) {
        fieldDefaults.forEach(func => field = func(field));
        return field;
      },
    };

  }(),

});
