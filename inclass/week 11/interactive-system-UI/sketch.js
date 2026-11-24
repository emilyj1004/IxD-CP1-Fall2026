// POND ECOSYSTEM: algae -> fish -> heron
// Emergent property: fish form schools from 3 simple rules.
// Controls: click the pond to add algae, use the sliders and buttons.
// Disclaimer: Much of the code was developed with AI, and may not reflect best practices for learning. Have been very busy given the holidays and beginning a new job. This project was still extremely interesting to work on, since I enjoy video game theory and simulation. 

let pond;
let sunSlider;
let schoolSlider;

const WORLD_W = 800;
const WORLD_H = 500;

const PALETTE = {
  bank:       [21, 33, 30],
  bankLight:  [32, 49, 36],
  mud:        [55, 71, 65],
  waterDark:  [22, 42, 41],
  waterLight: [64, 84, 80],
  reed:       [155, 152, 115],
  reedDark:   [102, 106, 76],
  stone:      [227, 209, 181],
  stoneShade: [155, 152, 115],
  algae:      [178, 180, 92],
  algaeDark:  [120, 128, 62],
  fish:       [250, 168, 108],
  heronBlue:  [92, 128, 165],
  heronDark:  [62, 90, 122],
  heronWhite: [236, 236, 228],
  beak:       [230, 190, 80]
};

// Runs once at the start
function setup() {
  createCanvas(WORLD_W, WORLD_H);

  pond = new Pond(30, 3, 30);

  createDiv('');
  createSpan(' Sunlight ');
  sunSlider = createSlider(0, 100, 60);

  createSpan('  Schooling ');
  schoolSlider = createSlider(0, 100, 60);

  createSpan('  ');
  let fishButton = createButton('Add fish');
  fishButton.mousePressed(addFishButton);

  let heronButton = createButton('Add heron');
  heronButton.mousePressed(addHeronButton);
}

// Runs every frame
function draw() {
  pond.update();
  pond.display();
  pond.showStats();
}

// Click the pond to drop algae
function mousePressed() {
  let x = mouseX;
  let y = mouseY;
  if (pond.edgeAmount(x, y) < 0.9) {
    for (let i = 0; i < 4; i++) {
      pond.algae.push(new Algae(x + random(-20, 20), y + random(-20, 20)));
    }
  }
}

function addFishButton() {
  let spot = pond.randomSpot();
  pond.fish.push(new Fish(spot.x, spot.y));
}

function addHeronButton() {
  let spot = pond.randomSpot();
  pond.herons.push(new Heron(spot.x, spot.y));
}

// Plants: food for fish
class Algae {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 4;
    this.maxSize = 14;

    this.blobs = [];
    let count = floor(random(3, 6));
    for (let i = 0; i < count; i++) {
      this.blobs.push({ dx: random(-0.6, 0.6), dy: random(-0.4, 0.4), r: random(0.5, 1) });
    }
  }

  grow(sunlight) {
    if (this.size < this.maxSize) {
      this.size = this.size + 0.03 * sunlight;
    }
  }

  show() {
    noStroke();
    let s = this.size;
    fill(PALETTE.algaeDark);
    for (let b of this.blobs) {
      ellipse(this.x + b.dx * s + 1, this.y + b.dy * s + 1, b.r * s * 1.3, b.r * s);
    }
    fill(PALETTE.algae);
    for (let b of this.blobs) {
      ellipse(this.x + b.dx * s, this.y + b.dy * s, b.r * s * 1.1, b.r * s * 0.8);
    }
  }
}

// Parent class shared by Fish and Heron
class Animal {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-1, 1);
    this.vy = random(-1, 1);
    this.maxSpeed = 1.6;
    this.size = 10;
    this.energy = 60;
  }

  move() {
    let edge = pond.edgeAmount(this.x, this.y);
    if (edge > 0.85) {
      this.steerToward(pond.cx, pond.cy, 0.3);
    }

    let speed = sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > this.maxSpeed) {
      this.vx = (this.vx / speed) * this.maxSpeed;
      this.vy = (this.vy / speed) * this.maxSpeed;
    }

    this.x = this.x + this.vx;
    this.y = this.y + this.vy;

    if (pond.edgeAmount(this.x, this.y) > 1) {
      this.x = this.x - this.vx;
      this.y = this.y - this.vy;
      this.vx = this.vx * -1;
      this.vy = this.vy * -1;
    }
  }

  steerToward(targetX, targetY, strength) {
    let d = dist(this.x, this.y, targetX, targetY);
    if (d > 0) {
      this.vx = this.vx + ((targetX - this.x) / d) * strength;
      this.vy = this.vy + ((targetY - this.y) / d) * strength;
    }
  }

  steerAway(targetX, targetY, strength) {
    this.steerToward(targetX, targetY, -strength);
  }

  findNearest(list) {
    let nearest = null;
    let nearestDist = Infinity;
    for (let thing of list) {
      let d = dist(this.x, this.y, thing.x, thing.y);
      if (d < nearestDist && thing !== this) {
        nearest = thing;
        nearestDist = d;
      }
    }
    return nearest;
  }

  isDead() {
    return this.energy <= 0;
  }
}

// Prey: schools, eats algae, flees herons
class Fish extends Animal {
  constructor(x, y) {
    super(x, y);
    this.size = 10;
    this.maxSpeed = 1.6;
    this.color = color(PALETTE.fish[0], PALETTE.fish[1] + random(-15, 15), PALETTE.fish[2] + random(-15, 15));
  }

  update(allFish, herons, algaeList, schooling) {
    this.maxSpeed = 1.6;

    let heron = this.findNearest(herons);
    if (heron && dist(this.x, this.y, heron.x, heron.y) < 80) {
      this.flee(heron);
    } else {
      if (this.energy > 40) {
        this.school(allFish, schooling);
      }

      if (this.energy < 60) {
        this.lookForFood(algaeList);
      }
    }

    this.move();
    this.energy = this.energy - 0.08;
  }

  flee(heron) {
    this.maxSpeed = 2.1;
    this.steerAway(heron.x, heron.y, 0.6);
  }

  // The 3 schooling rules (the emergent behaviour)
  school(allFish, schooling) {
    let strength = schooling / 100;

    let neighbours = 0;
    let centerX = 0, centerY = 0;
    let pushX = 0, pushY = 0;
    let avgVx = 0, avgVy = 0;

    for (let other of allFish) {
      let d = dist(this.x, this.y, other.x, other.y);
      if (other !== this && d < 70) {
        neighbours++;
        centerX += other.x;
        centerY += other.y;
        avgVx += other.vx;
        avgVy += other.vy;

        // Rule 2, separation: don't get too close
        if (d < 18 && d > 0) {
          pushX += (this.x - other.x) / d;
          pushY += (this.y - other.y) / d;
        }
      }
    }

    if (neighbours > 0) {
      centerX /= neighbours;
      centerY /= neighbours;
      avgVx /= neighbours;
      avgVy /= neighbours;

      // Rule 1, cohesion: move toward neighbours
      this.steerToward(centerX, centerY, 0.15 * strength);

      // Rule 3, alignment: match their direction
      this.vx += (avgVx - this.vx) * 0.2 * strength;
      this.vy += (avgVy - this.vy) * 0.2 * strength;
    }

    this.vx += pushX * 0.15;
    this.vy += pushY * 0.15;

    this.vx += random(-0.15, 0.15);
    this.vy += random(-0.15, 0.15);
  }

  lookForFood(algaeList) {
    let food = this.findNearest(algaeList);
    if (food == null) return;

    let d = dist(this.x, this.y, food.x, food.y);
    if (d < 120) {
      this.steerToward(food.x, food.y, 0.3);
    }
    if (d < this.size + food.size / 2) {
      this.energy += food.size * 3;
      algaeList.splice(algaeList.indexOf(food), 1);
    }
  }

  reproduce() {
    if (this.energy > 85) {
      this.energy = this.energy - 40;
      return new Fish(this.x, this.y);
    }
    return null;
  }

  show() {
    push();
    translate(this.x, this.y);
    rotate(atan2(this.vy, this.vx));
    noStroke();
    fill(0, 0, 0, 50);
    ellipse(3, 4, this.size * 1.8, this.size);
    fill(this.color);
    ellipse(0, 0, this.size * 1.8, this.size);
    triangle(-this.size * 0.7, 0,
             -this.size * 1.4, -this.size * 0.5,
             -this.size * 1.4,  this.size * 0.5);
    fill(255, 212, 175);
    ellipse(this.size * 0.1, 0, this.size * 0.9, this.size * 0.3);
    pop();
  }
}

// Predator: hunts fish. (x, y) is where its feet touch the water
class Heron extends Animal {
  constructor(x, y) {
    super(x, y);
    this.size = 26;
    this.maxSpeed = 2.25;
    this.energy = 100;
    this.restTime = 0;
    this.sightRange = 160;
    this.facing = 1;
  }

  update(allFish) {
    let prey = this.findNearest(allFish);

    if (this.restTime > 0) {
      this.restTime = this.restTime - 1;
      this.maxSpeed = 0.4;
      prey = null;
    } else {
      this.maxSpeed = 2.25;
    }

    if (prey && dist(this.x, this.y, prey.x, prey.y) > this.sightRange) {
      prey = null;
    }

    if (prey == null) {
      this.vx += random(-0.2, 0.2);
      this.vy += random(-0.2, 0.2);
    }

    if (prey) {
      let d = dist(this.x, this.y, prey.x, prey.y);

      if (d < this.size / 2) {
        this.energy += 35;
        this.restTime = 60;
        allFish.splice(allFish.indexOf(prey), 1);
      } else {
        this.steerToward(prey.x, prey.y, 0.4);
      }
    }

    this.move();
    this.energy = this.energy - 0.1;
  }

  reproduce() {
    if (this.energy > 170) {
      this.energy = this.energy - 85;
      return new Heron(this.x, this.y);
    }
    return null;
  }

  show() {
    if (this.vx > 0.3)  { this.facing = 1; }
    if (this.vx < -0.3) { this.facing = -1; }

    push();
    translate(this.x, this.y);
    scale(this.facing * 1.25, 1.25);

    noFill();
    stroke(PALETTE.waterLight[0] + 30, PALETTE.waterLight[1] + 30, PALETTE.waterLight[2] + 30, 140);
    strokeWeight(1.5);
    ellipse(0, 0, 24, 7);

    noStroke();
    fill(PALETTE.heronBlue[0], PALETTE.heronBlue[1], PALETTE.heronBlue[2], 55);
    ellipse(-2, 14, 26, 8);

    stroke(60, 62, 55);
    strokeWeight(1.5);
    line(-1, 0, -2, -18);
    line(3, 0, 2, -18);

    noStroke();
    push();
    translate(0, -25);
    rotate(0.45);
    fill(PALETTE.heronBlue);
    ellipse(0, 0, 34, 14);
    triangle(-14, -4, -26, 0, -14, 5);
    fill(PALETTE.heronDark);
    ellipse(-4, -2, 24, 8);
    pop();

    fill(PALETTE.heronWhite);
    ellipse(9, -30, 9, 12);

    stroke(PALETTE.heronWhite);
    strokeWeight(5);
    noFill();
    beginShape();
    vertex(9, -32);
    vertex(13, -40);
    vertex(8, -47);
    vertex(11, -55);
    endShape();

    noStroke();
    fill(PALETTE.heronWhite);
    ellipse(13, -57, 11, 8);
    fill(25, 30, 35);
    rect(8, -61, 9, 2.5);
    triangle(9, -60, 1, -57, 9, -58);
    fill(PALETTE.beak);
    triangle(17, -59, 17, -55, 32, -56);
    fill(20);
    circle(15, -58, 2);
    pop();
  }
}

// Holds every living thing and draws the scene
class Pond {
  constructor(numFish, numHerons, numAlgae) {
    this.cx = WORLD_W / 2;
    this.cy = WORLD_H / 2 + 25;
    this.rx = 320;
    this.ry = 180;

    this.fish = [];
    this.herons = [];
    this.algae = [];
    this.history = [];

    for (let i = 0; i < numFish; i++) {
      let spot = this.randomSpot();
      this.fish.push(new Fish(spot.x, spot.y));
    }
    for (let i = 0; i < numHerons; i++) {
      let spot = this.randomSpot();
      this.herons.push(new Heron(spot.x, spot.y));
    }
    for (let i = 0; i < numAlgae; i++) {
      let spot = this.randomSpot();
      this.algae.push(new Algae(spot.x, spot.y));
    }

    this.stones = [];
    for (let i = 0; i < 4; i++) {
      let spot = this.randomSpot();
      this.stones.push({ x: spot.x, y: spot.y, w: random(22, 36) });
    }
    this.reeds = [];
    for (let i = 0; i < 70; i++) {
      let angle = random(TWO_PI);
      let r = this.wobble(angle) * random(0.95, 1.12);
      this.reeds.push({
        x: this.cx + cos(angle) * this.rx * r,
        y: this.cy + sin(angle) * this.ry * r,
        h: random(10, 30),
        lean: random(-4, 4)
      });
    }
    this.bushes = [];
    for (let i = 0; i < 90; i++) {
      let angle = random(TWO_PI);
      let r = this.wobble(angle) * random(1.1, 1.6);
      this.bushes.push({
        x: this.cx + cos(angle) * this.rx * r,
        y: this.cy + sin(angle) * this.ry * r,
        w: random(14, 30),
        shade: random(1)
      });
    }
  }

  wobble(angle) {
    return 1 + 0.07 * sin(2 * angle + 0.6) + 0.05 * sin(3 * angle + 2) + 0.03 * sin(5 * angle);
  }

  // 0 = pond centre, 1 = shoreline, above 1 = land
  edgeAmount(x, y) {
    let dx = (x - this.cx) / this.rx;
    let dy = (y - this.cy) / this.ry;
    let angle = atan2(dy, dx);
    return sqrt(dx * dx + dy * dy) / this.wobble(angle);
  }

  randomSpot() {
    let x, y;
    do {
      x = random(WORLD_W);
      y = random(WORLD_H);
    } while (this.edgeAmount(x, y) > 0.8);
    return { x: x, y: y };
  }

  update() {
    let sunlight = sunSlider.value() / 100;
    let schooling = schoolSlider.value();

    for (let a of this.algae) {
      a.grow(sunlight);
    }
    if (random(1) < sunlight * 0.6 && this.algae.length < 110) {
      let spot = this.randomSpot();
      this.algae.push(new Algae(spot.x, spot.y));
    }

    for (let i = this.fish.length - 1; i >= 0; i--) {
      let f = this.fish[i];
      f.update(this.fish, this.herons, this.algae, schooling);

      let baby = f.reproduce();
      if (baby && this.fish.length < 120) {
        this.fish.push(baby);
      }
      if (f.isDead()) {
        this.fish.splice(i, 1);
      }
    }

    for (let i = this.herons.length - 1; i >= 0; i--) {
      let h = this.herons[i];
      h.update(this.fish);

      let baby = h.reproduce();
      if (baby && this.herons.length < 8) {
        this.herons.push(baby);
      }
      if (h.isDead()) {
        this.herons.splice(i, 1);
      }
    }

    if (frameCount % 10 == 0) {
      this.history.push({ fish: this.fish.length, herons: this.herons.length });
      if (this.history.length > 120) {
        this.history.shift();
      }
    }
  }

  drawShape(size) {
    beginShape();
    for (let a = 0; a < TWO_PI; a += 0.05) {
      let r = this.wobble(a) * size;
      vertex(this.cx + cos(a) * this.rx * r, this.cy + sin(a) * this.ry * r);
    }
    endShape(CLOSE);
  }

  display() {
    background(PALETTE.bank);

    let light = sunSlider.value() / 100;
    let water = lerpColor(color(PALETTE.waterDark), color(PALETTE.waterLight), light * 0.7);

    noStroke();
    fill(PALETTE.bankLight);
    this.drawShape(1.08);

    for (let b of this.bushes) {
      if (b.shade < 0.5) { fill(PALETTE.bankLight); }
      else if (b.shade < 0.85) { fill(48, 65, 55); }
      else { fill(78, 88, 73); }
      ellipse(b.x, b.y, b.w, b.w * 0.6);
    }
    fill(PALETTE.mud);
    this.drawShape(1.02);
    fill(water);
    this.drawShape(0.97);

    stroke(255, 255, 255, 18);
    strokeWeight(3);
    line(this.cx - 120, this.cy - 90, this.cx + 40, this.cy - 90);
    line(this.cx - 60, this.cy - 76, this.cx + 90, this.cy - 76);

    noStroke();
    for (let s of this.stones) {
      fill(PALETTE.stoneShade);
      ellipse(s.x + 2, s.y + 3, s.w, s.w * 0.6);
      fill(PALETTE.stone);
      ellipse(s.x, s.y, s.w * 0.9, s.w * 0.5);
    }

    for (let a of this.algae)  { a.show(); }
    for (let f of this.fish)   { f.show(); }
    for (let h of this.herons) { h.show(); }

    strokeWeight(2);
    for (let r of this.reeds) {
      stroke(PALETTE.reedDark);
      line(r.x, r.y, r.x + r.lean, r.y - r.h);
      stroke(PALETTE.reed);
      line(r.x + r.lean, r.y - r.h, r.x + r.lean * 1.2, r.y - r.h - 5);
    }
  }

  showStats() {
    noStroke();
    fill(0, 0, 0, 110);
    rect(8, 8, 264, 100, 8);

    fill(PALETTE.reed);
    textSize(14);
    text('Fish ' + this.fish.length, 20, 30);
    text('Herons ' + this.herons.length, 100, 30);
    text('Algae ' + this.algae.length, 190, 30);

    noFill();
    strokeWeight(2);
    stroke(PALETTE.fish);
    beginShape();
    for (let i = 0; i < this.history.length; i++) {
      vertex(20 + i * 2, 98 - this.history[i].fish * 0.5);
    }
    endShape();

    stroke(PALETTE.heronBlue[0] + 40, PALETTE.heronBlue[1] + 40, PALETTE.heronBlue[2] + 40);
    beginShape();
    for (let i = 0; i < this.history.length; i++) {
      vertex(20 + i * 2, 98 - this.history[i].herons * 6);
    }
    endShape();
  }
}