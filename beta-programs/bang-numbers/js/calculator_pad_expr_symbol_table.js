if (calculator_pad === undefined) {
  var calculator_pad = {}
}

// The symbol table should be used in a
// case-insensitive, manner. E.g.
// SYMBOL_TABLE[symbol.toLowerCase()]

calculator_pad.SYMBOL_TABLE = {
  'e': Math.E,
  'pi': Math.PI,
  'sqrt': Math.sqrt,
  'sin': Math.sin,
  'cos': Math.cos,
  'tan': Math.tan,
  'asin': Math.asin,
  'acos': Math.acos,
  'atan': Math.atan,
  'max': Math.max,
  'min': Math.min,
  'ceil': Math.ceil,
  'floor': Math.floor,
  'round': Math.round,
  'pow': Math.pow,
  'toradian': function(degree) {
    return degree * Math.PI / 180;
  },
  'todegree': function(radian) {
    return radian * 180 / Math.PI;
  },
};
