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
    const title = this.getTitle();

    let inner;
    if (this.props.thInner) {
      const Component = this.props.thInner;
      inner = (
        <Component
          name  = { this.props.name  }
          label = { this.props.label }
          sort  = { this.props.sort  }
        >{ title }</Component>
      );
    } else {
      inner = title;
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

  getTitle () {
    let title = '';

    if (this.props.label.length) {
      title = this.props.label;
    } else if (this.props.name.length) {
      title = this.props.name.split(/[_.]/).map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join(' ');
    }
    return title.trim();
  }

})
