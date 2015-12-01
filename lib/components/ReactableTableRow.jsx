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

      let classes = '';
      if (field.hasOwnProperty('classes')) {
        classes = field.classes;
        if (typeof field.classes === 'function') {
          classes = field.classes.call(this, value, this.props.data);
        }
        if (Array.isArray(classes)) {
          classes = classes.filter(c => {
            return typeof c === 'string' && c.length;
          }).join(' ');
        }
      }

      if (field.hasOwnProperty('transform')) {
        value = field.transform.call(this, value, this.props.data);
      }

      if (value !== null && typeof value === 'object') {
        value = value.toString();
      }

      return (
        <td className={ classes }>
          { value }
        </td>
      );
    }.bind(this));

    return React.createElement('tr', {}, ...cells);
  }

});
