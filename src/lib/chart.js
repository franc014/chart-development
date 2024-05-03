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
    ctx.globalAlpha = this.transparency;
    this.#drawSamples();
    ctx.globalAlpha = 1;
  }

  #drawSamples() {
    const { ctx, samples, pixelBounds, dataBounds } = this;
    for (const sample of samples) {
      const { point } = sample;
      const xLoc = math.remap(
        dataBounds.left,
        dataBounds.right,
        pixelBounds.left,
        pixelBounds.right,
        point[0]
      );
      const yLoc = math.remap(
        dataBounds.top,
        dataBounds.bottom,
        pixelBounds.top,
        pixelBounds.bottom,
        point[1]
      );

      const pixelLocation = [xLoc, yLoc];
      graphics.drawPoint(ctx, pixelLocation);
    }
  }
}

export default Chart;
