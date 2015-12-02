ReactableTable = React.createClass({

  propTypes: {
    classes:  React.PropTypes.string.isRequired,
    addTbody: React.PropTypes.bool.isRequired,
    tr:       React.PropTypes.func, // React class
    fields:   React.PropTypes.arrayOf(ReactableTypeField).isRequired,
    rows:     React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  },

  render () {

    let rows = this.props.rows.map(row => {
      return (
        <ReactableTableRow
          key    = { row._id }
          tr     = { this.props.tr }
          fields = { this.props.fields }
          data   = { row }
        />
      );
    });

    if (this.props.addTbody) {
      rows = <tbody>{ rows }</tbody>;
    }

    return (
      <table className={ this.props.classes }>
        <ReactableTableHead fields={ this.props.fields }/>
        { rows }
      </table>
    );
  },

});
