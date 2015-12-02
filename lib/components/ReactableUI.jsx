ReactableUI = React.createClass({

  propTypes: {
    classes:      ReactableTypeClasses.isRequired,
    tableClasses: ReactableTypeClasses.isRequired,
    fields:       React.PropTypes.arrayOf(ReactableTypeField).isRequired,
    rows:         React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    ready:        React.PropTypes.bool.isRequired,
  },

  render () {
    return (
      <div className={ this.getClasses() }>
        <ReactableTable
          classes = { this.props.tableClasses }
          fields  = { this.props.fields       }
          rows    = { this.props.rows         }
        />
      </div>
    )
  },

  getClasses () {
    let classes = this.props.classes;

    if (typeof classes === 'function') {
      classes = classes.call(this);
    }

    if (Array.isArray(classes)) {
      classes = classes.filter(c => {
        return c !== null && typeof c !== 'undefined';
      }).join(' ');
    }

    return ('reactable ' + classes).trim();
  },

});
