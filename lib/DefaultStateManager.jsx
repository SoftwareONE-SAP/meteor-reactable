DefaultStateManager = function () {
  return {
    get (k) {
      return this.state[ k ];
    },
    set (data) {
      this.setState(data);
    },
  };
};
