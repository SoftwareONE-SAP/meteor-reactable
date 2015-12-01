const T = React.PropTypes;

/**
 * This is the root component. It handles the configuration
 */

Reactable = React.createClass({

  propTypes: {
    tableClasses: ReactableTypeClasses,
    source:       ReactableTypeSource.isRequired,
    fields:       T.arrayOf(ReactableTypeField).isRequired,
  },

  getDefaultProps () {
    return {
      tableClasses: '',
    };
  },

  render () {

    let props = { ...this.props };
    delete props.children;
    props.fields = props.fields.map(field => {
      return Reactable.applyFieldDefaults(field);
    });

    return (
      <ReactableData { ...props }>
        { this.props.children }
      </ReactableData>
    );
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
