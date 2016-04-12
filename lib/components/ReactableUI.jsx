ReactableUI = React.createClass({

  mixins: [ ReactableClasses ],

  shouldComponentUpdate (nextProps) {
    return nextProps.ready;
  },

  render () {

    const classes = this.getClasses([
      'reactable',
      this.props.classes,
      this.props.ready ? null : 'loading',
    ]);

    if (this.props.rows.length === 0 && this.props.ready && this.props.empty) {
      let Component      = this.props.empty.body;
      let ComponentProps = this.props.empty.props;
      if (typeof ComponentProps === 'function') {
        ComponentProps = ComponentProps.call(this);
      }
      return (
        <div id={ this.props.id } className={ classes }>
          <Component { ...this.props } { ...ComponentProps }/>
        </div>
      );
    }

    return (
      <div id={ this.props.id } className={ classes }>
        <ReactableTable { ...this.tableProps() }/>
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
    props.setPaginate = this.props.onChangePaginate;
    return props;
  },

});
