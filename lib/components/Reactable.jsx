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
    return (
      <ReactableData {...this.props}>
        { this.props.children }
      </ReactableData>
    );
  },

});
