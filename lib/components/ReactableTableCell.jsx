ReactableTableCell = React.createClass({

  propTypes: {
    row:       React.PropTypes.object.isRequired,
    classes:   React.PropTypes.string,
    rowNumber: React.PropTypes.number,
    colNumber: React.PropTypes.number,
    label:     React.PropTypes.string,
  },

  render () {
    return (
      <td className={ this.props.classes }>
        { this.props.children }
      </td>
    );
  },

})
