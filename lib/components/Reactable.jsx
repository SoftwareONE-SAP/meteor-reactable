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
      } else if (typeof field.sort === 'object' && !field.direction) {
        field.direction = 1;
      }

      return Reactable.applyFieldDefaults(field);
    });

    // Convert "paginate" format from simple to advanced
    if (typeof props.paginate === 'number') {
      props.paginate = {
        defaultLimit: props.paginate,
      };
    }

    if (props.paginate.serverSide) {
      if (Array.isArray(props.source.collection)) {
        throw new Error("Can't use server side pagination with a non-reactive data source");
      }
      let hasSorter = false;
      props.fields.forEach(field => {
        if (field.sort) {
          hasSorter = true;
          if (field.sort.custom) {
            throw new Error("Can't use server side pagination with a custom sort function");
          }
          if (field.sort.transform) {
            throw new Error("Can't use server side pagination with a post-transform sort");
          }
          if (typeof field.name !== 'string' && field.transform) {
            throw new Error("Can't use server side pagination with a sortable non-named field");
          }
        }
      });
      if (!hasSorter) {
        throw new Error("Can't use server side pagination without at least one server-side sortable field");
      }
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
