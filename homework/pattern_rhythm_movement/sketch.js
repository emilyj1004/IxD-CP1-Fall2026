function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
  noStroke();
  noLoop();
}

function draw() {
  background(0, 0, 10);
  let w = 80;
  let h = 40;
  let rows = ceil(height / h);

  for (let j = 0; j < rows; j++) {
    for (let x = 0; x < width; x += w) {
      let y = j * h;
      fill(0, map(j, 0, rows - 1, 15, 100), 100);
      rect(x + 2, y + 2, w - 4, h - 4);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}