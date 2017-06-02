import React     from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';

ReactableTableHead = createReactClass({

  propTypes: {
    sort: PropTypes.shape({
      column:    PropTypes.number,
      direction: PropTypes.oneOf([1, -1]),
    }),
    fields:      PropTypes.arrayOf(ReactableTypeField).isRequired,
    onCellClick: PropTypes.func,
  },

  render () {
    let colNumber = 0;
    const cells = this.props.fields.map(field => {
      const column = colNumber++;
      let sort = !this.props.sort                  ? null
               : this.props.sort.column !== column ? null
               : this.props.sort.direction === 1   ? 'asc'
               : 'desc';

      return (
        <ReactableTableHeadCell
          colNumber = { column }
          name      = { field.name      }
          label     = { field.label     }
          classes   = { field.thClasses }
          thInner   = { field.thInner   }
          onClick   = { () => this.onCellClick(column) }
          sort      = { sort }
        />
      );
    });

    return (
      <thead>
        { React.createElement('tr', {}, ...cells) }
      </thead>
    );
  },

  onCellClick (column) {
    if (this.props.onCellClick) {
      this.props.onCellClick(column);
    }
  }
});
