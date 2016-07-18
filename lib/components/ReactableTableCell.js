import React, { PropTypes as T } from 'react';

ReactableTableCell = React.createClass({

  propTypes: {
    row:       T.object.isRequired,
    classes:   T.string,
    rowNumber: T.number,
    colNumber: T.number,
    label:     T.string,
  },

  render () {
    return (
      <td className={ this.props.classes }>
        { this.props.children }
      </td>
    );
  },

})
