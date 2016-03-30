/**
 * Define some PropTypes here that are used in multiple React components
 * to avoid duplication
 */

const T = React.PropTypes;

ReactableTypeClasses = T.oneOfType([ T.string, T.array, T.func ]);

ReactableTypeField = T.shape({
  name:      T.string,
  label:     T.string,
  transform: T.func,
  td:        T.func, // React class
  tdInner:   T.func, // React class
  thInner:   T.func, // React class
  tdClasses: ReactableTypeClasses,
  thClasses: ReactableTypeClasses,
  sort:      T.oneOfType([
    T.oneOf([-1, 1]),
    T.shape({
      direction: T.oneOf([-1, 1]),
      default:   T.bool,
      custom:    T.func,
      transform: T.bool,
      field:     T.string,
    }),
  ]),
});

ReactableTypeSource = T.shape({
  collection: T.oneOfType([ T.object, T.arrayOf(T.object) ]).isRequired,
  fields:     T.arrayOf(T.string),
  selector:   T.oneOfType([ T.object, T.func ]),
  subscribe:  T.oneOfType([
    T.string,
    T.func,
    T.shape({
      name:    T.string.isRequired,
      context: T.object, // Meteor or a DDP connection
      args:    T.oneOfType([ T.array, T.func ]),
      additionalArgs: T.func,
    }),
  ]),
});

ReactableConfigShape = {
  id:                T.string,
  classes:           ReactableTypeClasses,
  tableClasses:      ReactableTypeClasses,
  trClasses:         ReactableTypeClasses,
  tr:                T.func, // React class
  addTbody:          T.bool,
  staticColumnWidth: T.bool,
  source:            ReactableTypeSource.isRequired,
  fields:            T.arrayOf(ReactableTypeField).isRequired,
  paginate:          T.oneOfType([
    T.number,
    T.shape({
      ui:             T.func, // React classes
      defaultPage:    T.number,
      defaultLimit:   T.number.isRequired,
      serverSide:     T.object, // Stats collection
    }),
  ]),
  stateManager: T.func,
};
