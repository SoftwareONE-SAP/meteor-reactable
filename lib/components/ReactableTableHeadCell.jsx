ReactableTableHeadCell = React.createClass({

  propTypes: {
    name:    React.PropTypes.string,
    label:   React.PropTypes.string,
    classes: ReactableTypeClasses,
  },

  getDefaultProps () {
    return {
      name:    '',
      label:   '',
      classes: '',
    }
  },

  render () {
    return (
      <th className={ this.getClasses() }>
        { this.getTitle() }
      </th>
    );
  },

  getClasses () {
    let classes = this.props.classes;
    if (typeof classes === 'function') {
      classes = classes.call(this, this.props.name, this.props.label);
    }
    if (typeof classes === 'undefined' || classes === null) {
      classes = '';
    }
    if (Array.isArray(classes)) {
      classes = classes.filter(c => {
        return typeof c === 'string' && c.length;
      }).join(' ');
    }
    return classes;
  },

  getTitle () {
    let title = '';

    if (this.props.label.length) {
      title = this.props.label;
    } else if (this.props.name.length) {
      title = this.props.name.split('_').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join(' ');
    }
    return title.trim();
  }

})
