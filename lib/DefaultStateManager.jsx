DefaultStateManager = function () {
  return {
    get (k) {
      return this.state[ k ];
    },
    set (k, v) {
      let state = {};
      state[ k ] = v;
      this.setState(state);
    },
    del (k) {
      let state = {};
      state[ k ] = null;
      this.setState(state);
    },
  };
};
