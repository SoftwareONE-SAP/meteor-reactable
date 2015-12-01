ReactableTableCell = React.createClass({

  propTypes: {
    row:     React.PropTypes.object.isRequired,
    value:   React.PropTypes.string.isRequired,
    classes: React.PropTypes.string.isRequired,
  },

  render () {
    return (
      <td className={ this.props.classes }>
        { this.props.value }
      </td>
    );
  },

})
