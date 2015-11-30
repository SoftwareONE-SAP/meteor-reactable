const T = React.PropTypes;

/**
 * This is the root component. It handles the configuration
 */

Reactable = React.createClass({

  propTypes: {
    source: ReactableTypeSource.isRequired,
    fields: T.arrayOf(ReactableTypeField).isRequired,
  },

  render () {
    return (
      <ReactableData {...this.props}>
        { this.props.children }
      </ReactableData>
    );
  },

});
