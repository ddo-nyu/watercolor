let x1, y1 ,x2, y2, r, nsides, r2;
const serial = new p5.WebSerial();
let portButton;
let inData;

function windowResized() {
    resizeCanvas(window.innerWidth, window.innerHeight);
}

function setup() {
    webSerialSetup();
    createCanvas(window.innerWidth, window.innerHeight);
    frameRate(10);
    background(255);
    noStroke();

    x1 = 0;
    y1 = height / 2;
    r = 0;
    r2 = 0;

    x2 = width;
    y2 = height / 2;

    nsides = 10;

    const yellowColor = {
        R: 255,
        G: 240,
        B: 0,
        A: 0.01,
    };

    const blueColor = {
        R: 15,
        G: 10,
        B: 222,
        A: 0.01,
    }

    const greenColor = mixColors(yellowColor, blueColor);
    console.log(greenColor);
}

function draw() {
    fill('rgba(255, 240, 0, 0.01)');
    const yellowStack = polystack(mouseX, mouseY, 200, nsides);
    draw_stack(yellowStack);

    // if (r < (width / 2) - (width / 10)) {
    //     r += 10;
    // } else {
    //     r2 += 10;
    // }

    // fill('rgba(255, 240, 0, 0.01)');
    // const yellowStack = polystack(x1, y1, r, nsides);
    // draw_stack(yellowStack);

    // fill('rgba(15, 10, 222, 0.01)');
    // const blueStack = polystack(x2, y2, r, nsides);
    // draw_stack(blueStack);

    // if (r2 > 0) {
    //     fill('rgba(60, 179, 113, 0.01)');
    //     const greenStack = polystack(width / 2, height / 2, r2, nsides);
    //     draw_stack(greenStack);
    // }

    // if (inData) {
    //     const dataArr = parseData(inData);
    //     fill('rgba(15, 10, 222, 0.01)');
    //     console.log(parseFloat(dataArr[0]));
    //     const blueStack = polystack(width / 2, height / 2, parseFloat(dataArr[0]), nsides);
    //     draw_stack(blueStack);
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
        curveVertex(points[i].x, points[i].y);
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

function create_base_poly(x, y, r, nsides) {
    let bp = [];
    bp = rpoly(x, y, r, nsides);
    bp = deform(bp, 5, r/10, 2);
    return bp;
}

function polystack(x, y, r, nsides) {
    let stack = [];
    let base_poly, poly;

    /* Generate a base polygon with depth 5 and variance 15 */
    base_poly = rpoly(x, y, r, nsides);
    base_poly = deform(base_poly,  1, r/10, 2);

    /* Generate a variation of the base polygon with a random variance */
    for (let k = 0; k < 5; k++) {
        poly = deform(base_poly, 5, random(r/15, r/5), 4);
        stack.push(poly);
    }

    return stack;
}

function draw_stack(stack) {
    for (let i = 0; i < stack.length; i++) {
        draw_poly(stack[i]);
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
    serial.on("noport", makePortButton);
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
    }
    // hide the port button once a port is chosen:
    if (portButton) portButton.hide();
}

function portError(err) {
    alert("Serial port error: " + err);
}

function serialEvent() {
    inData = serial.readLine();
    // console.log(inData);
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