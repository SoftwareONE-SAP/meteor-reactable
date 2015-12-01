ReactableTableHead = React.createClass({

  propTypes: {
    fields: React.PropTypes.arrayOf(ReactableTypeField).isRequired,
  },

  render () {

    const cells = this.props.fields.map(field => {
      return (
        <ReactableTableHeadCell
          name    = { field.name }
          label   = { field.label }
          classes = { field.thClasses }
        />
      );
    });

    return (
      <thead>
        { React.createElement('tr', {}, ...cells) }
      </thead>
    );
  }
});
