import math from "./math.js";
import graphics from "./graphics.js";
class Chart {
  constructor(samples, options, canvas, onClick = null) {
    this.samples = samples;
    this.axesLabels = options.axesLabels;
    this.styles = options.styles;
    this.icon = options.icon;
    this.canvas = canvas;
    this.canvas.width = options.size;
    this.canvas.height = options.size;
    this.ctx = this.canvas.getContext("2d");
    this.margin = options.size * 0.1;

    this.transparency = "0.7";

    this.dataTrans = {
      offset: [0, 0],
      scale: 1,
    };

    this.dragInfo = {
      start: [0, 0],
      end: [0, 0],
      offset: [0, 0],
      dragging: false,
    };

    this.onClick = onClick;

    this.pixelBounds = this.#getPixelBounds();
    this.dataBounds = this.#getDataBounds();
    this.defaultDataBounds = this.#getDataBounds();
    //this.nearestSampleToMouse = null;
    this.hoveredSample = null;
    this.selectedSample = null;
    this.#draw();

    this.#addEventListeners();
  }

  #addEventListeners() {
    const { canvas, dataTrans, dragInfo } = this;

    canvas.addEventListener("mousedown", (e) => {
      //here we need the data coordinates
      const dataLoc = this.#getMouse(e, true);
      dragInfo.start = dataLoc;
      dragInfo.dragging = true;
    });

    canvas.addEventListener("mousemove", (e) => {
      if (dragInfo.dragging) {
        const dataLoc = this.#getMouse(e, true);
        dragInfo.end = dataLoc;
        //substract and also scale
        dragInfo.offset = math.scale(
          math.subtract(dragInfo.start, dragInfo.end),
          dataTrans.scale
        );
        const newOffset = math.add(dataTrans.offset, dragInfo.offset);

        this.#updateDataBounds(newOffset, dataTrans.scale);
      }
      const pixelLoc = this.#getMouse(e);
      const pPoints = this.samples.map((s) =>
        math.remapPoint(this.dataBounds, this.pixelBounds, s.point)
      );
      const index = math.getNearest(pixelLoc, pPoints);
      const nearest = this.samples[index];
      const dist = math.distance(pPoints[index], pixelLoc);
      if (dist < this.margin / 2) {
        this.hoveredSample = nearest;
      } else {
        this.hoveredSample = null;
      }
      //highlight nearest point to the mouse
      this.#draw();
    });

    canvas.addEventListener("mouseup", (e) => {
      dataTrans.offset = math.add(dataTrans.offset, dragInfo.offset);
      dragInfo.dragging = false;
    });

    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const dir = Math.sign(e.deltaY);
      const step = 0.02;
      dataTrans.scale += dir * step;
      //clamping the scale between the initial step and 2
      dataTrans.scale = Math.max(step, Math.min(2, dataTrans.scale));
      this.#updateDataBounds(dataTrans.offset, dataTrans.scale);
      this.#draw();
    });

    canvas.addEventListener("click", (e) => {
      if (this.hoveredSample) {
        this.selectedSample = this.hoveredSample;
        if (this.onClick) {
          this.onClick(this.selectedSample);
        }
        this.#draw();
      }
    });
  }

  #updateDataBounds(newOffset, scale) {
    const { dataBounds, defaultDataBounds: def } = this;
    dataBounds.left = def.left + newOffset[0];
    dataBounds.top = def.top + newOffset[1];
    dataBounds.right = def.right + newOffset[0];
    dataBounds.bottom = def.bottom + newOffset[1];

    //center of data as focal point
    const center = [
      (dataBounds.left + dataBounds.right) / 2,
      (dataBounds.top + dataBounds.bottom) / 2,
    ];
    //modify bounds according to scale, the center point and original value
    //square the scale to make the effect more smooth and increase always by the same amount
    dataBounds.left = math.lerp(center[0], dataBounds.left, scale ** 2);
    dataBounds.top = math.lerp(center[1], dataBounds.top, scale ** 2);
    dataBounds.right = math.lerp(center[0], dataBounds.right, scale ** 2);
    dataBounds.bottom = math.lerp(center[1], dataBounds.bottom, scale ** 2);
  }

  #getMouse(e, dataSpace = false) {
    const { canvas } = this;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (dataSpace) {
      return math.remapPoint(this.pixelBounds, this.defaultDataBounds, [x, y]);
    }
    return [x, y];
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
    this.#drawSamples(this.samples);
    ctx.globalAlpha = 1;

    if (this.hoveredSample) {
      this.#emphasizeSample(this.hoveredSample);
    }

    if (this.selectedSample) {
      this.#emphasizeSample(this.selectedSample, "hsl(52, 75%, 53%)");
    }
  }

  #emphasizeSample(sample, color = "white") {
    const { ctx, pixelBounds, dataBounds } = this;
    const { point } = sample;
    const pixelLocation = math.remapPoint(dataBounds, pixelBounds, point);
    const gradient = ctx.createRadialGradient(
      ...pixelLocation,
      0,
      ...pixelLocation,
      this.margin
    );
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    graphics.drawPoint(ctx, pixelLocation, gradient, this.margin * 2);
    this.#drawSamples([sample]);
  }

  #drawSamples(samples) {
    const { ctx, pixelBounds, dataBounds } = this;

    for (const sample of samples) {
      const { point, label } = sample;
      const pixelLocation = math.remapPoint(dataBounds, pixelBounds, point);
      switch (this.icon) {
        case "text":
          graphics.drawText(ctx, {
            text: this.styles[label].text,
            loc: pixelLocation,
            size: 12,
          });
          break;
        case "image":
          graphics.drawImage(ctx, this.styles[label].image, pixelLocation);
          break;
        default:
          graphics.drawPoint(ctx, pixelLocation, this.styles[label].color);
          break;
      }
    }
  }

  #drawAxes() {
    const { ctx, canvas, axesLabels, margin } = this;
    const { left, top, right, bottom } = this.pixelBounds;

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
