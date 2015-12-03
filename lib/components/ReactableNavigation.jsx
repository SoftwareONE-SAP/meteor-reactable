ReactableNavigation = React.createClass({

  propTypes: {
    totalRows:   React.PropTypes.number,
    pages:       React.PropTypes.number,
    limit:       React.PropTypes.number.isRequired,
    page:        React.PropTypes.number.isRequired,
    changeLimit: React.PropTypes.func.isRequired,
    changePage:  React.PropTypes.func.isRequired,
    ui:          React.PropTypes.func, // React class
    hasMore:     React.PropTypes.bool.isRequired,
  },

  render () {

    const UI = this.props.ui || ReactableNavigationUI;

    let props = { ...this.props };
    delete props.children;
    delete props.ui;
    props.nextPage = this.nextPage;
    props.prevPage = this.prevPage;

    return (
      <UI { ...props }/>
    );
  },

  changePage (newPage) {
    newPage = parseInt(newPage);
    if (isNaN(newPage) || newPage < 1) return;
    this.props.changePage(newPage);
  },
  nextPage () {
    this.changePage(this.props.page + 1);
  },
  prevPage () {
    this.changePage(this.props.page - 1);
  }
});

ReactableNavigationUI = React.createClass({

  propTypes: {
    totalRows:   React.PropTypes.number,
    pages:       React.PropTypes.number,
    limit:       React.PropTypes.number.isRequired,
    page:        React.PropTypes.number.isRequired,
    changeLimit: React.PropTypes.func.isRequired,
    changePage:  React.PropTypes.func.isRequired,
    nextPage:    React.PropTypes.func.isRequired,
    prevPage:    React.PropTypes.func.isRequired,
    hasMore:     React.PropTypes.bool.isRequired,
  },

  componentDidUpdate (prevProps) {
    if (prevProps.page !== this.props.page) {
      this.pageDom().value = this.props.page;
    }
    if (prevProps.limit !== this.props.limit) {
      this.limitDom().value = this.props.limit;
    }
  },

  render () {
    return (
      <div>
        <label>
          Show <input
            ref          = "limit"
            type         = "text"
            defaultValue = { this.props.limit     }
            onKeyPress   = { this.onLimitKeyPress }
            onBlur       = { this.onLimitBlur     }
          /> rows per page
        </label>

        {
          this.props.page > 1 ? (
            <span onClick={ this.props.prevPage }>◂</span>
          ) : null
        }

        <label>
          Page <input
            ref          = "page"
            type         = "text"
            defaultValue = { this.props.page     }
            onKeyPress   = { this.onPageKeyPress }
            onBlur       = { this.onPageBlur     }
          /> of { this.props.pages }
        </label>
        {
          this.props.hasMore ? (
            <span onClick={ this.props.nextPage }>▸</span>
          ) : null
        }

      </div>
    );
  },

  onPageKeyPress (e) {
    if (e.which !== 13) return; // Enter key
    this.props.changePage(this.pageDom().value);
  },

  onLimitKeyPress (e) {
    if (e.which !== 13) return; // Enter key
    this.props.changeLimit(this.limitDom().value);
  },

  onPageBlur () {
    this.pageDom().value = this.props.page;
  },

  onLimitBlur () {
    this.limitDom().value = this.props.limit;
  },

  pageDom () {
    return React.findDOMNode(this.refs.page);
  },

  limitDom () {
    return React.findDOMNode(this.refs.limit);
  },

});
