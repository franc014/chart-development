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

math.remapPoint = (oldBounds, newBounds, point) => {
  const xLoc = math.remap(
    oldBounds.left,
    oldBounds.right,
    newBounds.left,
    newBounds.right,
    point[0]
  );
  const yLoc = math.remap(
    oldBounds.top,
    oldBounds.bottom,
    newBounds.top,
    newBounds.bottom,
    point[1]
  );

  return [xLoc, yLoc];
};

math.add = (p1, p2) => {
  return [p1[0] + p2[0], p1[1] + p2[1]];
};

math.subtract = (p1, p2) => {
  return [p1[0] - p2[0], p1[1] - p2[1]];
};

math.scale = (p, scaler) => {
  return [p[0] * scaler, p[1] * scaler];
};

math.format = (n, dec) => {
  return n.toFixed(dec);
};

export default math;
