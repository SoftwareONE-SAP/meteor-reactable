import React     from 'react';
import PropTypes from 'prop-types';

/**
 * Define some PropTypes here that are used in multiple React components
 * to avoid duplication
 */

ReactableTypeClasses = PropTypes.oneOfType([ PropTypes.string, PropTypes.array, PropTypes.func ]);

ReactableTypeField = PropTypes.shape({
  name:      PropTypes.string,
  label:     PropTypes.string,
  transform: PropTypes.func,
  td:        PropTypes.func, // React class
  tdInner:   PropTypes.func, // React class
  thInner:   PropTypes.func, // React class
  tdClasses: ReactableTypeClasses,
  thClasses: ReactableTypeClasses,
  sort:      PropTypes.oneOfType([
    PropTypes.oneOf([-1, 1]),
    PropTypes.shape({
      direction: PropTypes.oneOf([-1, 1]),
      default:   PropTypes.bool,
      custom:    PropTypes.func,
      transform: PropTypes.bool,
      field:     PropTypes.string,
    }),
  ]),
});

ReactableTypeSource = PropTypes.shape({
  collection: PropTypes.oneOfType([ PropTypes.object, PropTypes.arrayOf(PropTypes.object) ]).isRequired,
  fields:     PropTypes.arrayOf(PropTypes.string),
  selector:   PropTypes.oneOfType([ PropTypes.object, PropTypes.func ]),
  subscribe:  PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
    PropTypes.shape({
      name:    PropTypes.string.isRequired,
      context: PropTypes.object, // Meteor or a DDP connection
      args:    PropTypes.oneOfType([ PropTypes.array, PropTypes.func ]),
      additionalArgs: PropTypes.func,
    }),
  ]),
  ready: PropTypes.Object,
});

ReactableConfigShape = {
  id:                PropTypes.string,
  classes:           ReactableTypeClasses,
  tableClasses:      ReactableTypeClasses,
  trClasses:         ReactableTypeClasses,
  tr:                PropTypes.func, // React class
  addTbody:          PropTypes.bool,
  staticColumnWidth: PropTypes.bool,
  source:            ReactableTypeSource.isRequired,
  fields:            PropTypes.arrayOf(ReactableTypeField).isRequired,
  paginate:          PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      ui:             PropTypes.func, // React classes
      defaultPage:    PropTypes.number,
      defaultLimit:   PropTypes.number.isRequired,
      serverSide:     PropTypes.object, // Stats collection
    }),
  ]),
  stateManager: PropTypes.func,
  empty: PropTypes.shape({
    body:  PropTypes.func, // React classes
    props: PropTypes.oneOfType([ PropTypes.func, PropTypes.object ]),
  }),
  stopped: PropTypes.shape({
    body:  PropTypes.func, // React classes
    props: PropTypes.oneOfType([ PropTypes.func, PropTypes.object ]),
  }),
};
