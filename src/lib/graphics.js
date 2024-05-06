const graphics = {};

graphics.drawPoint = function (ctx, loc, color = "blueviolet", size = 8) {
  ctx.beginPath();
  ctx.arc(...loc, size / 2, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
};

graphics.drawText = function (
  ctx,
  {
    text,
    loc,
    align = "center",
    vAlign = "middle",
    size = 20,
    color = "hsl(232, 75%, 33%)",
  }
) {
  ctx.textAlign = align;
  ctx.textBaseline = vAlign;
  ctx.font = `${size}px sans-serif`;
  ctx.fillStyle = color;
  ctx.fillText(text, ...loc);
};

export default graphics;
