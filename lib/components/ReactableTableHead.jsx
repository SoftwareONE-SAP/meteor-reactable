const T = React.PropTypes;

ReactableTableHead = React.createClass({

  propTypes: {
    sort: T.shape({
      column:    T.number,
      direction: T.oneOf([1, -1]),
    }),
    fields:      T.arrayOf(ReactableTypeField).isRequired,
    onCellClick: T.func,
  },

  render () {
    let colNumber = 0;
    const cells = this.props.fields.map(field => {
      const column = colNumber++;
      let sort = this.props.sort.column !== column ? null
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
