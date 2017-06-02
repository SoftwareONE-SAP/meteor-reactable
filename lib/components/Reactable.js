import React from 'react';
import createReactClass from 'create-react-class';

/**
 * This is the root component. It handles the configuration
 */

Reactable = createReactClass({

  propTypes: ReactableConfigShape,

  render () {

    let props = { ...this.props };
    delete props.children;

    // Convert "paginate" format from simple to advanced
    if (props.paginate) {

      if (typeof props.paginate === 'number') {
        props.paginate = {
          defaultLimit: props.paginate,
        };
      }

      if (typeof props.paginate === 'object' && !props.paginate.defaultPage) {
        props.paginate.defaultPage = 1;
      }
    }

    // Convert "fields" format from simple to advanced
    props.fields = props.fields.map(origField => {
      let field = { ...origField };

      // Convert "sort" format from simple to advanced
      if (typeof field.sort === 'number') {
        field.sort = { direction: field.sort };
      } else if (typeof field.sort === 'object' && !field.sort.direction) {
        field.sort.direction = 1;
      }

      // If a label isn't specified, calculate one from the name
      if (typeof field.label !== 'string' && field.name) {
        field.label = field.name.split(/[_.]/).map(word => {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ').trim();
      }

      return field;
    });

    // Apply custom configuration defaults
    props = Reactable.applyConfigDefaults(props);
    props.fields = props.fields.map(origField => {
      let field = { ...origField };
      return Reactable.applyFieldDefaults(field);
    });


    // Sanity checks on server side pagination
    if (props.paginate && props.paginate.serverSide) {
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

    props.isReactive = !Array.isArray(props.source.collection);

    return (
      <ReactableState { ...props }/>
    );
  },

  statics: (() => {

    let configDefaults = [];
    let fieldDefaults  = [];

    return {
      manageState (obj) {

      },
      setFieldDefaults (callback) {
        fieldDefaults.push(callback);
      },
      applyFieldDefaults (field) {
        fieldDefaults.forEach(func => field = func(field));
        return field;
      },
      setConfigDefaults (callback) {
        configDefaults.push(callback);
      },
      applyConfigDefaults (config) {
        configDefaults.forEach(func => config = func(config));
        return config;
      },
    };

  })(),

});
