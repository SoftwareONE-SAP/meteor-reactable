const T = React.PropTypes;

/**
 * This is the root component. It handles the configuration
 */

Reactable = React.createClass({

  propTypes: {
    id:           T.string,
    classes:      ReactableTypeClasses,
    tableClasses: ReactableTypeClasses,
    trClasses:    ReactableTypeClasses,
    tr:           React.PropTypes.func, // React class
    addTbody:     React.PropTypes.bool,
    source:       ReactableTypeSource.isRequired,
    fields:       T.arrayOf(ReactableTypeField).isRequired,
  },

  getInitialState () {
    return {
      sort: this.getInitialSortState(),
    };
  },

  getDefaultProps () {
    return {
      classes:      '',
      tableClasses: '',
      trClasses:    '',
      addTbody:     true,
    };
  },

  render () {

    let props = { ...this.props };
    delete props.children;
    props.fields = props.fields.map(field => {

      if (typeof field.sort === 'number') {
        field.sort = { direction: field.sort };
      }

      return Reactable.applyFieldDefaults(field);
    });

    props.sort = this.state.sort;

    props.onHeadCellClick = this.onHeadCellClick;

    return (
      <ReactableData { ...props }/>
    );
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
      if (!field.hasOwnProperty('name'))     return false;
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
