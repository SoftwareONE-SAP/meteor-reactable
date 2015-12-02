ReactableTableCell = React.createClass({

  propTypes: {
    row:     React.PropTypes.object.isRequired,
    classes: React.PropTypes.string.isRequired,
  },

  render () {
    return (
      <td className={ this.props.classes }>
        { this.props.children }
      </td>
    );
  },

})
