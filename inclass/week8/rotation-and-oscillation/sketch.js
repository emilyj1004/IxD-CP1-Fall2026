function setup() {
    createCanvas(800, 600);
}

function draw() {
    background(220);
    rotate(radians(45));
    createGrid(10);
}

function createGrid(gridResolution){
    for(let i = 0; i <= gridResolution; i++){
        let x = i * width/gridResolution
        stroke(0)
        line(x, 0, x, height)
    }
    for(let i = 0; i <= gridResolution; i++){
        let y = i * height/gridResolution
        stroke(0)
        line(0, y, width, y)
    }
}