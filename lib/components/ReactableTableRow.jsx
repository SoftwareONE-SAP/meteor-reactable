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
    classes:   ReactableTypeClasses,
    tr:        React.PropTypes.func, // React class
    fields:    React.PropTypes.arrayOf(ReactableTypeField).isRequired,
    data:      React.PropTypes.object.isRequired,
    rowNumber: React.PropTypes.number.isRequired,
  },

  render () {
    let colNumber = 0;
    const cells = this.props.fields.map(field => {
      let value;

      if (field.hasOwnProperty('name')) {

        let name = field.name;
        let data = this.props.data;

        while (true) {
          const i = name.indexOf('.');
          if (i === -1) break;
          const head = name.substr(0, i);
          name = name.substr(i + 1);
          if (data.hasOwnProperty(head) && typeof data[ head ] === 'object') {
            data = data[ head ];
          } else {
            value = null;
          }
        }

        if (typeof value === 'undefined') {
          value = data[ name ];
        }
      }

      let classes = this.getClasses([field.tdClasses], value);

      if (field.hasOwnProperty('transform')) {
        value = field.transform.call({ row: this.props.data }, value);
      }

      if (value !== null && typeof value === 'object') {
        value = value.toString();
      }

      if (value === null || typeof value === 'undefined') {
        value = '';
      }

      const TableCell = field.hasOwnProperty('td') ? field.td : ReactableTableCell;

      let cellProps = {
        row:       this.props.data,
        rowNumber: this.props.rowNumber,
        colNumber: colNumber++,
      };

      if (field.hasOwnProperty('tdInner')) {
        const Inner = field.tdInner;
        value = (
          <Inner {...cellProps}>
            { value }
          </Inner>
        );
      }

      return (
        <TableCell { ...cellProps} classes={ classes }>
          { value }
        </TableCell>
      );
    });

    const Row = this.props.tr || DefaultRow;
    return React.createElement(Row, {
      classes:   this.getClasses([this.props.classes]),
      fields:    this.props.fields,
      data:      this.props.data,
      rowNumber: this.props.rowNumber,
    }, ...cells);
  },
});
