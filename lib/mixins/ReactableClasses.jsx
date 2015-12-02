ReactableClasses = {

  /**
   * Flattens a class list that contains multiple levels of strings,
   * arrays, undefineds, nulls, functions etc down to a simple string
   *
   * getClasses([1, null, ["foo", 2], [[function(){ return "bar" }]]])
   *
   * Gives you: "1 foo 2 bar"
   */
  getClasses () {
    return flattenClasses.apply(this, arguments);
  },

};

function flattenClasses (classes, ...funcArgs) {
  return classes.map(c => {
    if (c === null) return '';
    if (typeof c === 'undefined') return '';
    if (typeof c === 'string')    return c;
    if (typeof c === 'number')    return String(c);
    if (typeof c === 'function') {
      const res = c.call(this, ...funcArgs);
      return flattenClasses.call(this, [res], ...funcArgs);
    }
    if (Array.isArray(c)) {
      return flattenClasses.call(this, c, ...funcArgs);
    }
    return '';
  }).join(' ').trim();
}
