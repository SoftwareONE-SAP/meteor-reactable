ReactableTableHead = React.createClass({

  propTypes: {
    fields:      React.PropTypes.arrayOf(ReactableTypeField).isRequired,
    onCellClick: React.PropTypes.func,
  },

  render () {

    const cells = this.props.fields.map(field => {
      return (
        <ReactableTableHeadCell
          name    = { field.name      }
          label   = { field.label     }
          classes = { field.thClasses }
          thInner = { field.thInner   }
          onClick = { () => this.onCellClick(field) }
        />
      );
    });

    return (
      <thead>
        { React.createElement('tr', {}, ...cells) }
      </thead>
    );
  },

  onCellClick (field) {
    if (this.props.onCellClick) {
      this.props.onCellClick(field);
    }
  }
});
