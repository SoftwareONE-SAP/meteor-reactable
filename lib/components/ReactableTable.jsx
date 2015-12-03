ReactableTable = React.createClass({

  mixins: [ ReactableClasses ],

  propTypes: {
    classes:         ReactableTypeClasses,
    trClasses:       ReactableTypeClasses,
    tr:              React.PropTypes.func, // React class
    addTbody:        React.PropTypes.bool,
    fields:          React.PropTypes.arrayOf(ReactableTypeField).isRequired,
    rows:            React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    onHeadCellClick: React.PropTypes.func,
  },

  getDefaultProps () {
    return {
      addTbody: true,
    };
  },

  render () {

    let count = 0;
    let rows = this.props.rows.map(row => {
      return (
        <ReactableTableRow
          key     = { row._id              }
          tr      = { this.props.tr        }
          classes = { this.props.trClasses }
          fields  = { this.props.fields    }
          data    = { row                  }
          count   = { ++count              }
        />
      );
    });

    if (this.props.addTbody) {
      rows = <tbody>{ rows }</tbody>;
    }

    return (
      <table className={ this.getClasses([this.props.classes]) }>
        <ReactableTableHead
          fields      = { this.props.fields    }
          onCellClick = { this.props.onHeadCellClick }
        />
        { rows }
      </table>
    );
  },

});
