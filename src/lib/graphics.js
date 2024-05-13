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

graphics.generateImages = function (styles, size = 20) {
  for (let label in styles) {
    const style = styles[label];
    const canvas = document.createElement("canvas");
    canvas.width = size + 10;
    canvas.height = size + 10;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${size}px sans-serif`;

    const colorHueMap = {
      red: 0,
      yellow: 60,
      green: 120,
      cyan: 180,
      blue: 240,
      magenta: 300,
    };
    const hue = -45 + colorHueMap[style.color];

    if (!isNaN(hue)) {
      ctx.filter = `
      brightness(0.8)
      contrast(1.5)
      sepia(1)
      hue-rotate(${hue}deg)
      saturate(4)
      `;
    } else {
      ctx.filter = "grayscale(0.7)";
    }
    ctx.fillText(style.text, canvas.width / 2, canvas.height / 2);
    style["image"] = new Image();
    style["image"].src = canvas.toDataURL();
  }
};

graphics.drawImage = function (ctx, image, loc) {
  ctx.beginPath();
  ctx.drawImage(
    image,
    loc[0] - image.width / 2,
    loc[1] - image.height / 2,
    image.width,
    image.height
  );
  ctx.fill();
};

export default graphics;
