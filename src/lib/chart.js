class Chart {
  constructor(samples, options, canvas) {
    this.samples = samples;
    this.axesLabels = options.axesLabels;
    this.styles = options.styles;
    this.canvas = canvas;
    this.canvas.width = options.size;
    this.canvas.height = options.size;
    this.ctx = this.canvas.getContext("2d");

    this.transparency = "0.5";
  }
}

export default Chart;
