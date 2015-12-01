/**
 * Define some PropTypes here that are used in multiple React components
 * to avoid duplication
 */

const T = React.PropTypes;

ReactableTypeClasses = T.oneOfType([ T.string, T.arrayOf(T.string), T.func ]);

ReactableTypeField = T.shape({
  name:      T.string.isRequired,
  label:     T.string,
  transform: T.func,
  tdClasses: ReactableTypeClasses,
  thClasses: ReactableTypeClasses,
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
    }),
  ]),
});
