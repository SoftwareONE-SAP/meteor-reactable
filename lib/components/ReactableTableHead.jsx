ReactableTableHead = React.createClass({

  propTypes: {
    fields: React.PropTypes.arrayOf(ReactableTypeField).isRequired,
  },

  render () {

    const cells = this.props.fields.map(field => {
      const name  = field.name;
      const title = field.hasOwnProperty('title') ? field.title : name;
      return (
        <th>
          { title }
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
