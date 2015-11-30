const T = React.PropTypes;

ReactableTypeField = T.shape({
    name:  T.string.isRequired,
    title: T.string,
});

ReactableTypeSource = T.shape({
  collection: T.oneOfType([ T.object, T.arrayOf(T.object) ]).isRequired,
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
