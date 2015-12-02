ReactableUI = React.createClass({

  render () {

    let props = { ...this.props };
    delete props.children;
    delete props.id;
    delete props.tableClasses;
    props.classes = this.getClasses(this.props.tableClasses);

    return (
      <div id={ this.props.id } className={ this.getClasses(this.props.classes) }>
        <ReactableTable {...props}/>
      </div>
    )
  },

  getClasses (classes) {

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
