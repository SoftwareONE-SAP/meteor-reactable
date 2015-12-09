ReactableTable = React.createClass({

  mixins: [ ReactableClasses ],

  propTypes: {
    classes:           ReactableTypeClasses,
    trClasses:         ReactableTypeClasses,
    tr:                React.PropTypes.func, // React class
    addTbody:          React.PropTypes.bool,
    staticColumnWidth: React.PropTypes.bool,
    fields:            React.PropTypes.arrayOf(ReactableTypeField).isRequired,
    rows:            React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    onHeadCellClick: React.PropTypes.func,
  },

  getDefaultProps () {
    return {
      addTbody: true,
    };
  },

  componentDidMount () {
    if (this.props.staticColumnWidth) {
      const tr        = React.findDOMNode(this).querySelector('thead > tr');
      const cells     = tr.querySelectorAll('th');
      const row_width = tr.offsetWidth;

      for (let i = 0; i < cells.length; ++i) {
        const cell  = cells[ i ];
        const width = ( cell.offsetWidth / row_width * 100 ) + '%';
        cell.width = width;
      }
    }
  },

  render () {

    let count = 0;
    let rows = this.props.rows.map(row => {
      return (
        <ReactableTableRow
          key       = { row._id              }
          tr        = { this.props.tr        }
          classes   = { this.props.trClasses }
          fields    = { this.props.fields    }
          row       = { row                  }
          rowNumber = { count++              }
        />
      );
    });

    if (this.props.addTbody) {
      rows = <tbody>{ rows }</tbody>;
    }

    return (
      <table className={ this.getClasses([this.props.classes]) }>
        <ReactableTableHead
          sort        = { this.props.sort }
          fields      = { this.props.fields }
          onCellClick = { this.props.onHeadCellClick }
        />
        { rows }
      </table>
    );
  },

});
