import React from 'react';
import createReactClass from 'create-react-class';

ReactableUI = createReactClass({

  mixins: [ ReactableClasses ],

  shouldComponentUpdate (nextProps) {
    // If ready state or stopped state has changed, then update
    if (nextProps.ready            !== this.props.ready) return true;
    if (nextProps.subscribeStopped !== this.props.subscribeStopped) return true;

    // Update on any further change, but only if we're ready
    return !!nextProps.ready;
  },

  render () {
    const classes = this.getClasses([
      'reactable',
      this.props.classes,
        this.props.subscribeStopped ? 'stopped'
      : this.props.ready ? null
      : 'loading',
    ]);

    if (this.props.subscribeStopped && this.props.stopped) {
      let Component      = this.props.stopped.body;
      let ComponentProps = this.props.stopped.props;
      if (typeof ComponentProps === 'function') {
        ComponentProps = ComponentProps.call(this);
      }
      return (
        <div id={ this.props.id } className={ classes }>
          <Component { ...this.props } { ...ComponentProps }/>
        </div>
      );
    }

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
