const timePeriod = document.querySelectorAll('a');

timePeriod.forEach(time => {
    time.addEventListener('click', (event) => {
        event.preventDefault();
        timePeriod.forEach(t => t.className = 'nav-link text-success');
        time.className = 'nav-link active text-success';
    });
});

var myCanvas = document.getElementById("myCanvas");
myCanvas.width = 300;
myCanvas.height = 300;
var ctx = myCanvas.getContext("2d");

function drawLine(ctx, startX, startY, endX, endY, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();
}

function drawArc(ctx, centerX, centerY, radius, startAngle, endAngle, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.stroke();
    ctx.restore();
}

function drawPieSlice(ctx, centerX, centerY, radius, startAngle, endAngle, fillColor, strokeColor) {
    ctx.save();
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
    if (strokeColor) {
        ctx.stroke();
    }
    ctx.restore();
}

var Piechart = function(options) {
  this.options = options;
  this.canvas = options.canvas;
  this.ctx = this.canvas.getContext("2d");
  this.colors = options.colors;
  this.titleOptions = options.titleOptions;
  this.totalValue = [...Object.values(this.options.data)].reduce((a, b) => a + b, 0);
  this.radius = Math.min(this.canvas.width / 2, this.canvas.height / 2) - options.padding;
  
  this.drawSlices = function() {
    var colorIndex = 0;
    var startAngle = -Math.PI / 2;
    for (var categ in this.options.data) {
      var val = this.options.data[categ];
      var sliceAngle = (2 * Math.PI * val) / this.totalValue;
      drawPieSlice(
        this.ctx,
        this.canvas.width / 2,
        this.canvas.height / 2,
        this.radius,
        startAngle,
        startAngle + sliceAngle,
        this.colors[colorIndex % this.colors.length],
        null // No stroke color
      );
      startAngle += sliceAngle;
      colorIndex++;
    }
  }
};

// Usage
var myPiechart = new Piechart({
  canvas: myCanvas,
  data: {
    "Category 1": 10,
    "Category 2": 20,
    "Category 3": 30,
    "Category 4": 40,
    "Category 5": 10,
    "Category 6": 20,
    "Category 7": 30
  },
  colors: ["#519DE9", "#7CC674", "#8481DD", "#F4C145", "#EE4B2B", "#A2D9D9", "#8A8D90"],
  padding: 20
});

myPiechart.drawSlices();
