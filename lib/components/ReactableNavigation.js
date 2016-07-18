import React, { PropTypes as T } from 'react';

ReactableNavigation = React.createClass({

  propTypes: {
    totalRows:    T.number,
    pages:        T.number,
    page:         T.number.isRequired,
    limit:        T.number.isRequired,
    defaultLimit: T.number.isRequired,
    setPaginate:  T.func.isRequired,
    ui:           T.func, // React class
    hasMore:      T.bool.isRequired,
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
    this.props.setPaginate({ page: newPage });
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
    totalRows:   T.number,
    pages:       T.number,
    limit:       T.number.isRequired,
    page:        T.number.isRequired,
    changeLimit: T.func.isRequired,
    changePage:  T.func.isRequired,
    nextPage:    T.func.isRequired,
    prevPage:    T.func.isRequired,
    hasMore:     T.bool.isRequired,
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
    this.props.setPaginate({ page: this.pageDom().value });
  },

  onLimitKeyPress (e) {
    if (e.which !== 13) return; // Enter key
    this.props.setPaginate({ limit: this.limitDom().value });
  },

  onPageBlur () {
    this.pageDom().value = this.props.page;
  },

  onLimitBlur () {
    this.limitDom().value = this.props.limit;
  },

  pageDom () {
    return this.refs.page;
  },

  limitDom () {
    return this.refs.limit;
  },

});
