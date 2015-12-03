ReactableUI = React.createClass({

  mixins: [ ReactableClasses ],

  render () {

    const classes = this.getClasses(['reactable', this.props.classes]);

    return (
      <div id={ this.props.id } className={ classes }>
        <ReactableTable      { ...this.tableProps() }/>
        {
          this.props.paginate ? (
            <ReactableNavigation { ...this.navigationProps() }/>
          ) : null
        }
      </div>
    )
  },

  tableProps () {
    let props = { ...this.props };
    delete props.children;
    delete props.id;
    delete props.navigation;
    props.classes = props.tableClasses;
    delete props.tableClasses;
    return props;
  },

  navigationProps () {
    let props = { ...this.props.paginate };
    props.changePage  = this.props.onChangePage;
    props.changeLimit = this.props.onChangeLimit;
    return props;
  },

});
