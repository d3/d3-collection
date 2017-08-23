export default function(map) {
  var values = [],
      keys = Object.keys(map),
      i = 0,
      ln = keys.length;
  for (; i < ln; ++i) values.push(map[keys[i]]);
  return values;
}
