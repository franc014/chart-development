const math = {};

math.lerp = (a, b, t) => {
  return a + (b - a) * t;
};

math.inverseLerp = (a, b, v) => {
  return (v - a) / (b - a);
};

math.remap = (oldA, oldB, newA, newB, v) => {
  const t = math.inverseLerp(oldA, oldB, v);
  return math.lerp(newA, newB, t);
};

math.format = (n, dec) => {
  return n.toFixed(dec);
};

export default math;
