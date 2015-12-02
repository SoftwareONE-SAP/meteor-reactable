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

      let classes = '';
      if (field.hasOwnProperty('tdClasses')) {
        classes = field.tdClasses;
        if (typeof classes === 'function') {
          classes = classes.call(this, value, this.props.data);
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
      classes: this.getClasses(),
      fields:  this.props.fields,
      data:    this.props.data,
      count:   this.props.count,
    }, ...cells);
  },

  getClasses () {
    let classes = this.props.classes;
    if (typeof classes === 'function') {
      classes = classes.call(this, this.props.count);
    }
    if (Array.isArray(classes)) {
      classes = classes.filter(c => {
        return typeof c === 'string' && c.length;
      }).join(' ');
    }
    return classes;
  },

});
