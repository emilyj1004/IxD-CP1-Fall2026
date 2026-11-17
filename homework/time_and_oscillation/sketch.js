let angle = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(230, 80, 25);

  let px = width / 3;
  let py = 0;
  let len = height / 2;
  let swing = sin(angle) * PI / 4;
  let bx = px + sin(swing) * len;
  let by = py + cos(swing) * len;
  stroke(30, 100, 100);
  strokeWeight(3);
  line(px, py, bx, by);
  noStroke();
  fill(30, 100, 100);
  circle(bx, by, 80);

  let y = height / 2 + sin(angle) * 150;
  circle(width * 2 / 3, y, 80);

  angle += 0.03;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}