const graphics = {};

graphics.drawPoint = function (ctx, loc, color = "blueviolet", size = 8) {
  ctx.beginPath();
  ctx.arc(...loc, size / 2, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
};
export default graphics;
