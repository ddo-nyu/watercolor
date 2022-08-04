onmessage = e => {
    const params = e.data;
    const stack = polystack(params.x, params.y, params.r, params.nsides);
    postMessage(stack);
}

const TWO_PI = 2 * Math.PI;

function polystack(x, y, r, nsides) {
    let stack = [];
    let base_poly, poly;

    /* Generate a base polygon with depth 5 and variance 15 */
    base_poly = rpoly(x, y, r, nsides);
    base_poly = deform(base_poly,  1, r/4, 2);

    /* Generate a variation of the base polygon with a random variance */
    for (let k = 0; k < 3; k++) {
        poly = deform(base_poly, 2, r/4, 2);
        stack.push(poly);
    }

    return stack;
}

function rpoly(x, y, radius, npoints) {
    let angle = TWO_PI / npoints;
    const polygonVertices = [];
    for (let a = 0; a < TWO_PI; a += angle) {
        let sx = x + Math.cos(a) * radius;
        let sy = y + Math.sin(a) * radius;
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

function randomGaussian(){
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}