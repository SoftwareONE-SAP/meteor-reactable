ReactableTableRow = React.createClass({

  propTypes: {
    fields: React.PropTypes.arrayOf(ReactableTypeField).isRequired,
    data:   React.PropTypes.object.isRequired,
  },

  render () {

    const cells = this.props.fields.map(field => {
      let value;

      if (field.hasOwnProperty('key')) {
        value = this.props.data[ field.key ];
      }

      if (field.hasOwnProperty('transform')) {
        value = field.transform.call(this, value, data);
      }

      if (value !== null && typeof value === 'object') {
        value = value.toString();
      }

      return (
        <td>
          { value }
        </td>
      );
    }.bind(this));

    return React.createElement('tr', {}, ...cells);
  }

});
