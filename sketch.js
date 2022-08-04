let r;
let arrBuffer = [];
const nsides = 5;
let sounds = [];
let song;
let currentSound = null;
let inData;
const myWorker = new Worker('worker.js');
const COLORS = {
    YELLOW: 'rgba(255, 187, 0, 0.05)',
    PINK: 'rgba(163, 2, 61, 0.01)',
    BLUE: 'rgba(5, 0, 135, 0.05)',
};
let currentColor = COLORS.BLUE;
let graphics;

function preload() {
    soundFormats('mp3', 'ogg');
    sounds.push(loadSound('sounds/sound1'));
    sounds.push(loadSound('sounds/sound2'));
    sounds.push(loadSound('sounds/sound3'));
    // song = loadSound('sounds/3');
}

function setup() {
    webSerialSetup();
    createCanvas(window.innerWidth, window.innerHeight);
    frameRate(10);
    noStroke();

    r = 100;
}

function draw() {
    if (graphics) {
        image(graphics, width, height);
    }

    if (arrBuffer.length > 0) {
        // if(!currentSound) {
        //     const randomIndex = round(random(0, sounds.length - 1));
        //     currentSound = sounds[randomIndex];
        // } else if (!currentSound.isPlaying()) {
        //     currentSound.play();
        //     currentSound = null;
        // }

        // if (!song?.isPlaying()) {
        //     song?.play();
        // }
        //
        // song?.setVolume(1, 3);

        arrBuffer.forEach(ab => {
            myWorker.postMessage({
                x: ab.x,
                y: ab.y,
                r: ab.r,
                nsides,
            });
            myWorker.onmessage = e => {
                fill(ab.color);
                draw_stack(e.data);
            }
        });
    } else {
        // song?.setVolume(0, 3);
        // song?.pause();
    }
}

function draw_poly(points) {
    beginShape();
    for (let i = 0; i < points.length; i++) {
        vertex(points[i].x, points[i].y);
    }
    endShape(CLOSE);
}

function rpoly(x, y, radius, npoints) {
    let angle = TWO_PI / npoints;
    const polygonVertices = [];
    for (let a = 0; a < TWO_PI; a += angle) {
        let sx = x + cos(a) * radius;
        let sy = y + sin(a) * radius;
        polygonVertices.push({ x: sx, y: sy });
    }
    return polygonVertices;
}

function deform(points, depth, variance, vdiv) {
    let sx1, sy1, sx2 = 0, sy2 = 0;
    const new_points = [];

    if (points.length == 0) {
        return new_points;
    }

    /* Iterate over existing edges in a pairwise fashion. */
    for (let i = 0; i < points.length; i++) {
        sx1 = points[i].x;
        sy1 = points[i].y;
        sx2 = points[(i + 1) % points.length].x;
        sy2 = points[(i + 1) % points.length].y;

        new_points.push({ x: sx1, y: sy1 });
        subdivide(new_points, sx1, sy1, sx2, sy2,
            depth, variance, vdiv);
    }

    return new_points;
}

function subdivide(new_points, x1, y1, x2, y2, depth, variance, vdiv) {
    let midx, midy;
    let nx, ny;

    if (depth >= 0) {
        /* Find the midpoint of the two points comprising the edge */
        midx = (x1 + x2) / 2;
        midy = (y1 + y2) / 2;

        /* Move the midpoint by a Gaussian variance */
        nx = midx + randomGaussian() * variance;
        ny = midy + randomGaussian() * variance;

        /* Add two new edges which are recursively subdivided */
        subdivide(new_points, x1, y1, nx, ny,
            depth - 1, variance/vdiv, vdiv);
        new_points.push({ x: nx, y: ny });
        subdivide(new_points, nx, ny, x2, y2,
            depth - 1, variance/vdiv, vdiv);
    }
}

function draw_stack(stack) {
    for (let i = 0; i < stack.length; i++) {
        draw_poly(stack[i]);
    }
}

function create_base_poly(x, y, r, nsides) {
    let bp = [];
    bp = rpoly(x, y, r, nsides);
    bp = deform(bp, 6, r/8, 2);
    return bp;
}

function polystack(x, y, r, nsides) {
    let stack = [];
    let base_poly, poly;

    /* Generate a base polygon with depth 5 and variance 15 */
    base_poly = rpoly(x, y, r, nsides);
    base_poly = deform(base_poly,  1, r/4, 2);

    /* Generate a variation of the base polygon with a random variance */
    for (let k = 0; k < 3; k++) {
        poly = deform(base_poly, 5, r/4, 2);
        stack.push(poly);
    }

    return stack;
}

function screenshot() {
    graphics = createGraphics(width, height);
    arrBuffer = [];
}

function doubleClicked() {
    let fs = fullscreen();
    fullscreen(!fs);
}
