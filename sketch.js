let x1, y1 ,x2, y2, r, r2, y3, w1, h1;
let arrBuffer = [];

const serial = new p5.WebSerial();
let portButton;
let inData;

let maxR;
const nsides = 5;

let YELLOW = 'rgba(255, 187, 0, 0.05)';
let PINK = 'rgba(163, 2, 61, 0.01)';
let BLUE = 'rgba(5, 0, 135, 0.05)';

let currentColor = BLUE;

function windowResized() {
    screenshot();
    resizeCanvas(window.innerWidth, window.innerHeight);
}

window.addEventListener('dblclick', () => {
    let fs = fullscreen();
    fullscreen(!fs);
});

// setInterval(() => {
//     screenshot();
// }, 10000);

let sounds = [];
let currentSound = null;
function preload() {
    soundFormats('mp3', 'ogg');
    sounds.push(loadSound('sounds/sound1'));
    sounds.push(loadSound('sounds/sound2'));
    sounds.push(loadSound('sounds/sound3'));
}

function setup() {
    webSerialSetup();
    createCanvas(window.innerWidth, window.innerHeight);
    // frameRate(1);
    background(255);
    noStroke();

    maxR = 100;
    r2 = 0;
    r = 10;

}

let graphics;
function screenshot() {
    graphics = createGraphics(width, height);

    //empty arrBuffer;
    arrBuffer = [];
}

function setBrushRadius(newR) {
    r = 10;
    maxR = newR;
}

function draw() {
    // console.log(arrBuffer);

    if (graphics) {
        image(graphics, width, height);
    }

    // if (x1 && y1) {
    //     fill(currentColor);
    //     const blueStack = polystack(x1, y1, r, nsides);
    //     draw_stack(blueStack);
    //     if (r < maxR) {
    //         r+=1;
    //     }
    // }


    if (arrBuffer.length > 0) {
        // if(!currentSound) {
        //     const randomIndex = round(random(0, sounds.length - 1));
        //     currentSound = sounds[randomIndex];
        // } else if (!currentSound.isPlaying()) {
        //     currentSound.play();
        //     currentSound = null;
        // }
        arrBuffer.forEach(ab => {
            fill(ab.color);
            const blueStack = polystack(ab.x, ab.y, r, nsides);
            draw_stack(blueStack);
            if (r < maxR) {
                r+=1;
            }
        });
    }

    // if (arrBuffer.length > 0) {
    //     fill('rgba(15, 10, 222, 0.03)');
    //     for (let i = 0; i < arrBuffer.length; i++) {
    //         const x = arrBuffer[i].x + (arrBuffer[i].w / 2);
    //         const y = arrBuffer[i].y + (arrBuffer[i].y / 2);
    //         const blueStack = polystack(x, y, r, nsides);
    //         draw_stack(blueStack);
    //         r+=10;
    //     }
    // }


    // if (inData) {
    //     const dataArr = parseData(inData);
    //     fill('rgba(15, 10, 222, 0.01)');
    //     const blueStack = polystack(width / 2, height / 2, parseFloat(dataArr[0]), nsides);
    //     draw_stack(blueStack);
    // } else {
    //     if (r < (width / 2) ) {
    //         r += 3;
    //     } else {
    //         r2 += 3;
    //         // y3 += 3;
    //     }
    //
    //     fill(YELLOW);
    //     const stack1 = polystack(x1, y1, r, nsides);
    //     draw_stack(stack1);
    //
    //     fill(PINK);
    //     const stack2 = polystack(x2, y2, r, nsides);
    //     draw_stack(stack2);
    //
    //     if (r2 > 0 && r2 < width / 2) {
    //         fill(BLUE);
    //         const stack3 = polystack(width / 2, height / 2, r2, nsides);
    //         draw_stack(stack3);
    //     }
    // }
}

function mixColors(fg, bg) {
    const r = {};
    r.A = 1 - (1 - fg.A) * (1 - bg.A);
    if (r.A < 1.0e-6) return r; // Fully transparent -- R,G,B not important
    r.R = fg.R * fg.A / r.A + bg.R * bg.A * (1 - fg.A) / r.A;
    r.G = fg.G * fg.A / r.A + bg.G * bg.A * (1 - fg.A) / r.A;
    r.B = fg.B * fg.A / r.A + bg.B * bg.A * (1 - fg.A) / r.A;
    return `${r.R}, ${r.G}, ${r.B}, ${r.A}`;
}

function draw_poly(points) {
    beginShape();
    for (let i = 0; i < points.length; i++) {
        vertex(points[i].x, points[i].y);
    }
    endShape(CLOSE);
    // fill('black');
    // circle(random(0, points[i].x), random(0, points[i].y), 5);
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

function create_base_poly(x, y, r, nsides) {
    let bp = [];
    bp = rpoly(x, y, r, nsides);
    bp = deform(bp, 5, r/4, 2);
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

function draw_stack(stack) {
    for (let i = 0; i < stack.length; i++) {
        draw_poly(stack[i]);
        // screenshot();
    }
}

function webSerialSetup() {
    // check to see if serial is available:
    if (!navigator.serial) {
        alert("WebSerial is not supported in this browser. Try Chrome or MS Edge.");
    }
    // check for any ports that are available:
    serial.getPorts();
    // if there's no port chosen, choose one:
    // serial.on("noport", makePortButton);
    // open whatever port is available:
    serial.on("portavailable", openPort);
    // handle serial errors:
    serial.on("requesterror", portError);
    // handle any incoming serial data:
    serial.on("data", serialEvent);
    serial.on("close", makePortButton)

    // add serial connect/disconnect listeners from WebSerial API:
    navigator.serial.addEventListener("connect", portConnect);
    navigator.serial.addEventListener("disconnect", portDisconnect);
}

function makePortButton() {
    // create and position a port chooser button:
    portButton = createButton('choose port');
    portButton.position(10, 10);
    // give the port button a mousepressed handler:
    portButton.mousePressed(choosePort);
}

function choosePort() {
    if (portButton) portButton.show();
    serial.requestPort();
}

function openPort() {
    // wait for the serial.open promise to return,
    // then call the initiateSerial function
    serial.open().then(initiateSerial);

    // once the port opens, let the user know:
    function initiateSerial() {
        console.log("port open");
        document.querySelector('.control-panel').classList.add('hide');
    }
    // hide the port button once a port is chosen:
    if (portButton) portButton.hide();
}

function portError(err) {
    alert("Serial port error: " + err);
}

function serialEvent() {
    inData = serial.readLine();
}

function portConnect() {
    console.log("port connected");
    serial.getPorts();
}

// if a port is disconnected:
function portDisconnect() {
    serial.close();
    console.log("port disconnected");
}

function closePort() {
    serial.close();
}

function parseData(data) {
    return data.split(';');
}


