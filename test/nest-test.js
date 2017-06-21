var tape = require("tape"),
    d3 = Object.assign({}, require("d3-array"), require("../"));

tape("nest.entries(array) returns the array of input values, in input order", function(test) {
  var nest = d3.nest();
  test.deepEqual(nest.entries([1, 2, 3]), [1, 2, 3]);
  test.deepEqual(nest.entries([1, 3, 2]), [1, 3, 2]);
  test.deepEqual(nest.entries([3, 1, 2]), [3, 1, 2]);
  test.end();
});

tape("nest.sortValues(order).entries(array) returns input values in sorted order", function(test) {
  var nestAscending = d3.nest().sortValues(function(a, b) { return a.foo - b.foo; }),
      nestDescending = d3.nest().sortValues(function(a, b) { return b.foo - a.foo; }),
      a = {foo: 1},
      b = {foo: 2},
      c = {foo: 3};
  test.deepEqual(nestAscending.entries([a, b, c]), [a, b, c]);
  test.deepEqual(nestAscending.entries([a, c, b]), [a, b, c]);
  test.deepEqual(nestAscending.entries([c, a, b]), [a, b, c]);
  test.deepEqual(nestDescending.entries([a, b, c]), [c, b, a]);
  test.deepEqual(nestDescending.entries([a, c, b]), [c, b, a]);
  test.deepEqual(nestDescending.entries([c, a, b]), [c, b, a]);
  test.end();
});

tape("nest.key(key).entries(array) returns entries for each distinct key, with values in input order", function(test) {
  var nest = d3.nest().key(function(d) { return d.foo; }).sortKeys(d3.ascending),
      a = {foo: 1},
      b = {foo: 1},
      c = {foo: 2};
  test.deepEqual(nest.entries([c, a, b, c]), [{key: "1", values: [a, b]}, {key: "2", values: [c, c]}]);
  test.deepEqual(nest.entries([c, b, a, c]), [{key: "1", values: [b, a]}, {key: "2", values: [c, c]}]);
  test.end();
});

tape("nest.key(key) coerces key values to strings", function(test) {
  var nest = d3.nest().key(function(d) { return d.number ? 1 : "1"; }).sortKeys(d3.ascending),
      a = {number: true},
      b = {number: false};
  test.deepEqual(nest.entries([a, b]), [{key: "1", values: [a, b]}]);
  test.end();
});

tape("nest.key(key1).key(key2).entries(array) returns entries for each distinct key set, with values in input order", function(test) {
  var nest = d3.nest().key(function(d) { return d.foo; }).sortKeys(d3.ascending).key(function(d) { return d.bar; }).sortKeys(d3.ascending),
      a = {foo: 1, bar: "a"},
      b = {foo: 1, bar: "a"},
      c = {foo: 2, bar: "a"},
      d = {foo: 1, bar: "b"},
      e = {foo: 1, bar: "b"},
      f = {foo: 2, bar: "b"};
  test.deepEqual(nest.entries([a, b, c, d, e, f]), [{key: "1", values: [{key: "a", values: [a, b]}, {key: "b", values: [d, e]}]}, {key: "2", values: [{key: "a", values: [c]}, {key: "b", values: [f]}]}]);
  test.deepEqual(nest.entries([f, e, d, c, b, a]), [{key: "1", values: [{key: "a", values: [b, a]}, {key: "b", values: [e, d]}]}, {key: "2", values: [{key: "a", values: [c]}, {key: "b", values: [f]}]}]);
  test.end();
});

tape("nest.key(key).sortKeys(order).entries(array) sorts entries by key using the specified order function", function(test) {
  var nest = d3.nest().key(function(d) { return d.foo; }).sortKeys(d3.descending),
      a = {foo: 1},
      b = {foo: 1},
      c = {foo: 2};
  test.deepEqual(nest.entries([c, a, b, c]), [{key: "2", values: [c, c]}, {key: "1", values: [a, b]}]);
  test.deepEqual(nest.entries([c, b, a, c]), [{key: "2", values: [c, c]}, {key: "1", values: [b, a]}]);
  test.end();
});

tape("nest.key(key1).sortKeys(order1).key(key2).sortKeys(order2).entries(array) sorts entries by key using the specified order functions", function(test) {
  var nest = d3.nest().key(function(d) { return d.foo; }).sortKeys(d3.descending).key(function(d) { return d.bar; }).sortKeys(d3.descending),
      a = {foo: 1, bar: "a"},
      b = {foo: 1, bar: "a"},
      c = {foo: 2, bar: "a"},
      d = {foo: 1, bar: "b"},
      e = {foo: 1, bar: "b"},
      f = {foo: 2, bar: "b"};
  test.deepEqual(nest.entries([a, b, c, d, e, f]), [{key: "2", values: [{key: "b", values: [f]}, {key: "a", values: [c]}]}, {key: "1", values: [{key: "b", values: [d, e]}, {key: "a", values: [a, b]}]}]);
  test.deepEqual(nest.entries([f, e, d, c, b, a]), [{key: "2", values: [{key: "b", values: [f]}, {key: "a", values: [c]}]}, {key: "1", values: [{key: "b", values: [e, d]}, {key: "a", values: [b, a]}]}]);
  test.end();
});

tape("nest.rollup(rollup).entries(array) aggregates values using the specified rollup function", function(test) {
  test.equal(d3.nest().rollup(function(values) { return values.length; }).entries([1, 2, 3, 4, 5]), 5);
  test.equal(d3.nest().rollup(d3.sum).entries([1, 2, 3, 4, 5]), 1 + 2 + 3 + 4 + 5);
  test.equal(d3.nest().rollup(d3.max).entries([1, 2, 3, 4, 5]), 5);
  test.deepEqual(d3.nest().rollup(d3.extent).entries([1, 2, 3, 4, 5]), [1, 5]);
  test.end();
});

tape("nest.rollup(rollup) uses the global this context", function(test) {
  var that;
  d3.nest().rollup(function() { that = this; }).entries([1, 2, 3, 4, 5]);
  test.equal(that, global);
  test.end();
});

tape("nest.key(key).rollup(rollup).entries(array) aggregates values per key using the specified rollup function", function(test) {
  var a = {foo: 1},
      b = {foo: 1},
      c = {foo: 2};
  test.deepEqual(d3.nest().key(function(d) { return d.foo; }).rollup(function(values) { return values.length; }).entries([a, b, c]), [{key: "1", value: 2}, {key: "2", value: 1}]);
  test.end();
});

tape("nest.key(key).sortValues(order).rollup(rollup).entries(array) sorts values before rollup", function(test) {
  var a = {foo: 1, bar: 1},
      b = {foo: 1, bar: 2},
      c = {foo: 2, bar: 3};
  test.deepEqual(d3.nest().key(function(d) { return d.foo; }).sortValues(function(a, b) { return b.bar - a.bar; }).rollup(function(values) { return values[0].bar; }).entries([a, b, c]), [{key: "1", value: 2}, {key: "2", value: 3}]);
  test.end();
});

tape("nest.map(array) returns the array of input values, in input order", function(test) {
  var nest = d3.nest();
  test.deepEqual(nest.map([1, 2, 3]), [1, 2, 3]);
  test.deepEqual(nest.map([1, 3, 2]), [1, 3, 2]);
  test.deepEqual(nest.map([3, 1, 2]), [3, 1, 2]);
  test.end();
});

tape("nest.sortValues(order).map(array) returns input values in sorted order", function(test) {
  var nestAscending = d3.nest().sortValues(function(a, b) { return a.foo - b.foo; }),
      nestDescending = d3.nest().sortValues(function(a, b) { return b.foo - a.foo; }),
      a = {foo: 1},
      b = {foo: 2},
      c = {foo: 3};
  test.deepEqual(nestAscending.map([a, b, c]), [a, b, c]);
  test.deepEqual(nestAscending.map([a, c, b]), [a, b, c]);
  test.deepEqual(nestAscending.map([c, a, b]), [a, b, c]);
  test.deepEqual(nestDescending.map([a, b, c]), [c, b, a]);
  test.deepEqual(nestDescending.map([a, c, b]), [c, b, a]);
  test.deepEqual(nestDescending.map([c, a, b]), [c, b, a]);
  test.end();
});

tape("nest.key(key).map(array) returns entries for each distinct key, with values in input order", function(test) {
  var nest = d3.nest().key(function(d) { return d.foo; }).sortKeys(d3.ascending),
      a = {foo: 1},
      b = {foo: 1},
      c = {foo: 2};
  test.deepEqual(nest.map([c, a, b, c]), d3.map({1: [a, b], 2: [c, c]}));
  test.deepEqual(nest.map([c, b, a, c]), d3.map({1: [b, a], 2: [c, c]}));
  test.end();
});

tape("nest.key(key1).key(key2).map(array) returns entries for each distinct key set, with values in input order", function(test) {
  var nest = d3.nest().key(function(d) { return d.foo; }).sortKeys(d3.ascending).key(function(d) { return d.bar; }).sortKeys(d3.ascending),
      a = {foo: 1, bar: "a"},
      b = {foo: 1, bar: "a"},
      c = {foo: 2, bar: "a"},
      d = {foo: 1, bar: "b"},
      e = {foo: 1, bar: "b"},
      f = {foo: 2, bar: "b"};
  test.deepEqual(nest.map([a, b, c, d, e, f]), d3.map({1: d3.map({a: [a, b], b: [d, e]}), 2: d3.map({a: [c], b: [f]})}));
  test.deepEqual(nest.map([f, e, d, c, b, a]), d3.map({1: d3.map({a: [b, a], b: [e, d]}), 2: d3.map({a: [c], b: [f]})}));
  test.end();
});

tape("nest.rollup(rollup).map(array) aggregates values using the specified rollup function", function(test) {
  test.equal(d3.nest().rollup(function(values) { return values.length; }).map([1, 2, 3, 4, 5]), 5);
  test.equal(d3.nest().rollup(d3.sum).map([1, 2, 3, 4, 5]), 1 + 2 + 3 + 4 + 5);
  test.equal(d3.nest().rollup(d3.max).map([1, 2, 3, 4, 5]), 5);
  test.deepEqual(d3.nest().rollup(d3.extent).map([1, 2, 3, 4, 5]), [1, 5]);
  test.end();
});

tape("nest.key(key).rollup(rollup).map(array) aggregates values per key using the specified rollup function", function(test) {
  var a = {foo: 1},
      b = {foo: 1},
      c = {foo: 2};
  test.deepEqual(d3.nest().key(function(d) { return d.foo; }).rollup(function(values) { return values.length; }).map([a, b, c]), d3.map({1: 2, 2: 1}));
  test.end();
});
