const DefaultRow = React.createClass({
  render () {
    return (
      <tr className={ this.props.classes }>
        { this.props.children }
      </tr>
    );
  },
});

ReactableTableRow = React.createClass({

  mixins: [ ReactableClasses ],

  propTypes: {
    classes: ReactableTypeClasses.isRequired,
    tr:      React.PropTypes.func, // React class
    fields:  React.PropTypes.arrayOf(ReactableTypeField).isRequired,
    data:    React.PropTypes.object.isRequired,
    count:   React.PropTypes.number.isRequired,
  },

  render () {

    const cells = this.props.fields.map(field => {
      let value;

      if (field.hasOwnProperty('name')) {
        value = this.props.data[ field.name ];
      }

      let classes = this.getClasses([field.tdClasses], value);

      if (field.hasOwnProperty('transform')) {
        value = field.transform.call(this, value);
      }

      if (value !== null && typeof value === 'object') {
        value = value.toString();
      }

      if (value === null || typeof value === 'undefined') {
        value = '';
      }

      const TableCell = field.hasOwnProperty('td') ? field.td : ReactableTableCell;

      if (field.hasOwnProperty('tdInner')) {
        const Inner = field.tdInner;
        value = (
          <Inner row={ this.props.data }>
            { value }
          </Inner>
        );
      }

      return (
        <TableCell classes={ classes } row={ this.props.data }>
          { value }
        </TableCell>
      );
    });

    const Row = this.props.tr || DefaultRow;
    return React.createElement(Row, {
      classes: this.getClasses([this.props.classes]),
      fields:  this.props.fields,
      data:    this.props.data,
      count:   this.props.count,
    }, ...cells);
  },
});
