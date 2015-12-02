ReactableUI = React.createClass({

  mixins: [ ReactableClasses ],

  render () {

    let props = { ...this.props };
    delete props.children;
    delete props.id;
    delete props.tableClasses;
    props.classes = this.getClasses([this.props.tableClasses]);

    return (
      <div id={ this.props.id } className={ this.getClasses(['reactable', this.props.classes]) }>
        <ReactableTable {...props}/>
      </div>
    )
  },
});
