ReactableTable = React.createClass({

  propTypes: {
    fields: React.PropTypes.arrayOf(ReactableTypeField).isRequired,
    rows:   React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  },

  render () {

    const rows = this.props.rows.map(row => {
      return (
        <ReactableTableRow
          key    = { row._id }
          fields = { this.props.fields }
          data   = { row }
        />
      );
    });

    return (
      <table>
        <ReactableTableHead fields={ this.props.fields }/>
        <tbody>
          { rows }
        </tbody>
      </table>
    );
  },

});
