ReactableUI = React.createClass({

  propTypes: {
    fields: React.PropTypes.arrayOf(ReactableTypeField).isRequired,
    rows:   React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    ready:  React.PropTypes.bool.isRequired,
  },

  render () {
    return (
      <div className="reactable">
        <ReactableTable
          fields = { this.props.fields }
          rows   = { this.props.rows }
        />
      </div>
    )
  },

});
