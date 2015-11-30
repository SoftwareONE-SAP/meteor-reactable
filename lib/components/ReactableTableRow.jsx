ReactableTableRow = React.createClass({

  propTypes: {
    fields: React.PropTypes.arrayOf(ReactableTypeField).isRequired,
    data:   React.PropTypes.object.isRequired,
  },

  render () {

    const cells = this.props.fields.map(field => {

      let value = this.props.data[ field.name ];

      if (value !== null && typeof value === 'object') {
        value = value.toString();
      }

      return (
        <td>
          { value }
        </td>
      );
    });

    return React.createElement('tr', {}, ...cells);
  }

});
