ReactableTableHead = React.createClass({

  propTypes: {
    fields: React.PropTypes.arrayOf(ReactableTypeField).isRequired,
  },

  render () {

    const cells = this.props.fields.map(field => {
      let label;

      if (field.hasOwnProperty('label')) {
        label = field.label;
      } else if (field.hasOwnProperty('key')) {
        label = field.key.split('_').map(word => {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
      }

      return (
        <th>
          { label }
        </th>
      );
    });

    return (
      <thead>
        { React.createElement('tr', {}, ...cells) }
      </thead>
    );
  }
});
