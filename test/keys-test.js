var tape = require("tape"),
    d3 = Object.assign({}, require("d3-array"), require("../"));

require("./isNaN");

tape("keys(object) enumerates every entry", function(test) {
  test.deepEqual(d3.keys({a: 1, b: 2}).sort(d3.ascending), ["a", "b"]);
  test.end();
});

tape("keys(object) includes keys defined on prototypes", function(test) {
  function abc() {
    this.a = 1;
    this.b = 2;
  }
  abc.prototype.c = 3;
  test.deepEqual(d3.keys(new abc).sort(d3.ascending), ["a", "b", "c"]);
  test.end();
});

tape("keys(object) includes null, undefined and NaN values", function(test) {
  test.deepEqual(d3.keys({a: null, b: undefined, c: NaN}).sort(d3.ascending), ["a", "b", "c"]);
  test.end();
});
