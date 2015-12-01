ReactableTableHeadCell = React.createClass({

  propTypes: {
    key:     React.PropTypes.string,
    label:   React.PropTypes.string,
    classes: React.PropTypes.string,
  },

  render () {
    return (
      <th className={ this.getClasses() }>
        { this.getTitle() }
      </th>
    );
  },

  getClasses () {
    let classes = '';
    if (this.props.hasOwnProperty('thClasses')) {
      classes = this.props.thClasses;
      if (typeof classes === 'function') {
        classes = classes.call(this, this.props.key, this.props.getTitle());
      }
      if (Array.isArray(classes)) {
        classes = classes.filter(c => {
          return typeof c === 'string' && c.length;
        }).join(' ');
      }
    }
    return classes;
  },

  getTitle () {
    let title = '';

    console.log("FOO", this.props);

    if (this.props.hasOwnProperty('label')) {
      title = this.props.label;
    } else if (this.props.hasOwnProperty('key')) {
      title = this.props.key.split('_').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join(' ');
    }
    return title.trim();
  }

})
