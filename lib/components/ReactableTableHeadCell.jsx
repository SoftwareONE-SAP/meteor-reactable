ReactableTableHeadCell = React.createClass({

  mixins: [ ReactableClasses ],

  propTypes: {
    name:     React.PropTypes.string,
    label:    React.PropTypes.string,
    classes:  ReactableTypeClasses,
    thInner:  React.PropTypes.func, // React class
    onClick:  React.PropTypes.func,
    sort:     React.PropTypes.oneOf(['asc', 'desc']),
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
          name  = { this.props.name }
          sort  = { this.props.sort }
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
