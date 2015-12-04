/**
 * This is the root component. It handles the configuration
 */

Reactable = React.createClass({

  propTypes: ReactableConfigShape,

  render () {

    let props = { ...this.props };
    delete props.children;

    props.isReactive = !Array.isArray(props.source.collection);

    // Field sorting fixups
    props.fields = props.fields.map(origField => {
      let field = { ...origField };

      // Convert "sort" format from simple to advanced
      if (typeof field.sort === 'number') {
        field.sort = { direction: field.sort };
      }
      return Reactable.applyFieldDefaults(field);
    });

    // Convert "paginate" format from simple to advanced
    if (typeof props.paginate === 'number') {
      props.paginate = {
        defaultLimit: props.paginate,
      };
    }

    return (
      <ReactableState { ...props }/>
    );
  },

  statics: () => {

    let fieldDefaults = [];

    return {
      setFieldDefaults (callback) {
        fieldDefaults.push(callback);
      },
      applyFieldDefaults (field) {
        fieldDefaults.forEach(func => field = func(field));
        return field;
      },
    };

  }(),

});
