ReactableUI = React.createClass({

  propTypes: {
    tableClasses: ReactableTypeClasses.isRequired,
    fields:       React.PropTypes.arrayOf(ReactableTypeField).isRequired,
    rows:         React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    ready:        React.PropTypes.bool.isRequired,
  },

  render () {
    return (
      <div className="reactable">
        <ReactableTable
          classes = { this.props.tableClasses }
          fields  = { this.props.fields       }
          rows    = { this.props.rows         }
        />
      </div>
    )
  },

});
