import React     from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';

ReactableTable = createReactClass({

  mixins: [ ReactableClasses ],

  propTypes: {
    classes:           ReactableTypeClasses,
    trClasses:         ReactableTypeClasses,
    tr:                PropTypes.func, // React class
    addTbody:          PropTypes.bool,
    staticColumnWidth: PropTypes.bool,
    fields:            PropTypes.arrayOf(ReactableTypeField).isRequired,
    rows:            PropTypes.arrayOf(PropTypes.object).isRequired,
    onHeadCellClick: PropTypes.func,
  },

  getDefaultProps () {
    return {
      addTbody: true,
    };
  },

  componentDidMount () {
    if (this.props.staticColumnWidth) {
      const tr        = this.querySelector('thead > tr');
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
      const classes = [
        'row',
        count % 2 ? 'even' : 'odd',
        this.props.trClasses,
      ];
      return (
        <ReactableTableRow
          key       = { row._id           }
          tr        = { this.props.tr     }
          classes   = { classes           }
          fields    = { this.props.fields }
          row       = { row               }
          rowNumber = { count++           }
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
