var tape = require("tape"),
    d3 = Object.assign({}, require("d3-array"), require("../"));

require("./isNaN");

tape("values(object) enumerates every value", function(test) {
  test.deepEqual(d3.values({a: 1, b: 2}).sort(d3.ascending), [1, 2]);
  test.end();
});

tape("values(object) includes values defined on prototypes", function(test) {
  function abc() {
    this.a = 1;
    this.b = 2;
  }
  abc.prototype.c = 3;
  test.deepEqual(d3.values(new abc).sort(d3.ascending), [1, 2, 3]);
  test.end();
});

tape("values(object) includes null, undefined and NaN values", function(test) {
  var v = d3.values({a: null, b: undefined, c: NaN}).map(box).sort(order).map(unbox);
  test.equal(v.length, 3);
  test.equal(v[0], null);
  test.equal(v[1], undefined);
  test.isNaN(v[2]);
  test.end();
});

function box(value) {
  return {value: value};
}

function unbox(box) {
  return box.value;
}

function order(a, b) {
  a = a.value;
  b = b.value;
  return d3.ascending(a, b)
      || isNaN(a) - isNaN(b)
      || (b === b) - (a === a);
}
