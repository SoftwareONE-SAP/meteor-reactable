import React, { PropTypes as T } from 'react';

ReactableTableHeadCell = React.createClass({

  mixins: [ ReactableClasses ],

  propTypes: {
    colNumber: T.number,
    name:      T.string,
    label:     T.string,
    classes:   ReactableTypeClasses,
    thInner:   T.func, // React class
    onClick:   T.func,
    sort:      T.oneOf(['asc', 'desc']),
  },

  getDefaultProps () {
    return {
      name:    '',
      label:   '',
    }
  },

  render () {
    let inner;
    if (this.props.thInner) {
      const Component = this.props.thInner;
      inner = (
        <Component
          name       = { this.props.name }
          sort       = { this.props.sort }
          colNumber = { this.props.colNumber }
        >{ this.props.label }</Component>
      );
    } else {
      inner = this.props.label;
    }

    const classes = this.getClasses([
      this.props.sort ? ['sort', this.props.sort] : null,
      this.props.classes,
    ]);

    return (
      <th className={ classes } onClick={ this.onClick }>
        { inner }
      </th>
    );
  },

  onClick (e) {
    if (this.props.onClick) {
      this.props.onClick(e, this.props);
    }
  },

})
