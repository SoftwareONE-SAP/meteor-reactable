ReactableTable = React.createClass({

  propTypes: {
    classes: ReactableTypeClasses.isRequired,
    fields:  React.PropTypes.arrayOf(ReactableTypeField).isRequired,
    rows:    React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
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
      <table className={ this.getClasses() }>
        <ReactableTableHead fields={ this.props.fields }/>
        <tbody>
          { rows }
        </tbody>
      </table>
    );
  },

  getClasses () {
    let classes = this.props.classes;

    if (typeof classes === 'function') {
      classes = classes.call(this);
    }

    if (Array.isArray(classes)) {
      classes = classes.filter(c => {
        return c !== null && typeof c !== 'undefined';
      }).join(' ');
    }

    return classes;
  },

});
