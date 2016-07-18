/**
 * This exists to assist template.html. End-users of this library need
 * not be aware of it.
 */

Template.Reactable.helpers({

  config () {
    let config = this;
    if (!config.hasOwnProperty('component')) {
      config.component = Reactable;
    }
    return config;
  },

});
