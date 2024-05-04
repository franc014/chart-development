import math from "./math.js";
import graphics from "./graphics.js";
class Chart {
  constructor(samples, options, canvas) {
    this.samples = samples;
    this.axesLabels = options.axesLabels;
    this.styles = options.styles;
    this.canvas = canvas;
    this.canvas.width = options.size;
    this.canvas.height = options.size;
    this.ctx = this.canvas.getContext("2d");
    this.margin = options.size * 0.1;

    this.transparency = "0.5";
    this.pixelBounds = this.#getPixelBounds();
    this.dataBounds = this.#getDataBounds();

    this.#draw();
  }
  #getPixelBounds() {
    const { canvas, margin } = this;
    const bounds = {
      left: margin,
      top: margin,
      right: canvas.width - margin,
      bottom: canvas.height - margin,
    };
    return bounds;
  }

  #getDataBounds() {
    const { samples } = this;

    const x = samples.map((sample) => sample.point[0]);
    const y = samples.map((sample) => sample.point[1]);

    const bounds = {
      left: Math.min(...x),
      top: Math.max(...y),
      right: Math.max(...x),
      bottom: Math.min(...y),
    };

    return bounds;
  }

  #draw() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.#drawAxes();
    ctx.globalAlpha = this.transparency;
    this.#drawSamples();
    ctx.globalAlpha = 1;
  }

  #drawSamples() {
    const { ctx, samples, pixelBounds, dataBounds } = this;

    for (const sample of samples) {
      const { point } = sample;

      const pixelLocation = math.remapPoint(dataBounds, pixelBounds, point);
      graphics.drawPoint(ctx, pixelLocation);
    }
  }

  #drawAxes() {
    const { ctx, canvas, axesLabels, margin } = this;
    const { left, top, right, bottom } = this.pixelBounds;

    console.log({ left, top, right, bottom });
    graphics.drawText(ctx, {
      text: axesLabels[0],
      loc: [canvas.width / 2, bottom + margin / 2],
      size: margin * 0.4,
    });

    ctx.save();
    //translate to left edge
    ctx.translate(left - margin / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);

    graphics.drawText(ctx, {
      text: axesLabels[1],
      loc: [0, 0],
      size: margin * 0.4,
    });
    ctx.restore(); //crutial, if not next drawings will also be translated and rotated

    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, bottom);
    ctx.lineTo(right, bottom);
    ctx.setLineDash([5, 2]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "hsl(232, 35%, 73%)";
    ctx.stroke();
    ctx.setLineDash([]);

    const dataMin = math.remapPoint(this.pixelBounds, this.dataBounds, [
      left,
      bottom,
    ]);

    const dataMax = math.remapPoint(this.pixelBounds, this.dataBounds, [
      right,
      top,
    ]); //extreme right point that is for our interest

    graphics.drawText(ctx, {
      text: math.format(dataMin[0], 2),
      loc: [left, bottom + margin / 4],
      size: margin * 0.3,
      align: "left",
      vAlign: "top",
    });

    ctx.save();

    ctx.translate(left, bottom);
    ctx.rotate(-Math.PI / 2);

    graphics.drawText(ctx, {
      text: math.format(dataMin[1], 2),
      loc: [0, -margin / 3],
      size: margin * 0.3,
    });
    ctx.restore();

    graphics.drawText(ctx, {
      text: math.format(dataMax[0], 2),
      loc: [right, bottom + margin / 4],
      size: margin * 0.3,
      align: "right",
      vAlign: "top",
    });

    ctx.save();
    ctx.translate(left, top);
    ctx.rotate(-Math.PI / 2);

    graphics.drawText(ctx, {
      text: math.format(dataMax[1], 2),
      loc: [0, -margin / 2],
      size: margin * 0.3,
      align: "right",
      vAlign: "top",
    });

    ctx.restore();
  }
}

export default Chart;
