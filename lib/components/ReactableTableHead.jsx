ReactableTableHead = React.createClass({

  propTypes: {
    fields:      React.PropTypes.arrayOf(ReactableTypeField).isRequired,
    onCellClick: React.PropTypes.func,
  },

  render () {

    let count = 0;
    const cells = this.props.fields.map(field => {
      let column = count++;
      return (
        <ReactableTableHeadCell
          name    = { field.name      }
          label   = { field.label     }
          classes = { field.thClasses }
          thInner = { field.thInner   }
          onClick = { () => this.onCellClick(column) }
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
