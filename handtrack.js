const video = document.getElementById("pose-video");
const canvas = document.querySelector("#pose-canvas");
const context = canvas.getContext("2d");

let isVideo = false;
let model = null;

video.width = window.innerWidth;
video.height = window.innerHeight;

const modelParams = {
    flipHorizontal: true,
    outputStride: 16,
    imageScaleFactor: 1,
    maxNumBoxes: 20,
    iouThreshold: 0.2,
    scoreThreshold: 0.3,
    modelType: "ssd320fpnlite",
    modelSize: "large",
    bboxLineWidth: "2",
    fontSize: 17,
};

function startVideo() {
    handTrack.startVideo(video).then(function (status) {
        console.log("video started", status);
        if (status) {
            isVideo = true;
            runDetection();
        }
    });
}

let arr = [];

function runDetection() {
    model.detect(video).then((predictions) => {

        const openHands = predictions.filter(p => p.label === 'open');
        if (openHands.length > 0) {
            openHands.forEach(oh => {
                // x1 = oh.bbox[0];
                // y1 = oh.bbox[1];
                // w1 = oh.bbox[2];
                // h1 = oh.bbox[3];
                const points = {
                    x: oh.bbox[0] + (oh.bbox[2] / 2),
                    y: oh.bbox[1] + (oh.bbox[3] / 2),
                    color: currentColor,
                };
                // console.log(points);
                arrBuffer.push(points);
                // x1 = points.x;
                // y1 = points.y;

            })
        } else {
            // console.log(arr);
            // arrBuffer = arr;
            // arr = [];
            // screenshot();
            // clear();
            // arr = [];
        }

        // render video
        model.renderPredictions(predictions, canvas, context, video);
        if (isVideo) {
            requestAnimationFrame(runDetection);
        }
    });
}

// Load the model.
handTrack.load(modelParams).then((lmodel) => {
    model = lmodel;
    console.log('model ready');
    startVideo();
});

document.querySelector('#brush-size-input').onchange = e => {
    console.log('brush size changed: ', e.target.value);
    setBrushRadius(parseInt(e.target.value));
    screenshot();
};

document.querySelectorAll('input[name="brush-color"]').forEach(radio => {
    radio.onclick = (e) => {
        currentColor = e.target.value;
        screenshot();
    }
})

// document.querySelector('.arrow-wrapper').onclick = e => {
//     document.querySelector('.control-panel').classList.toggle('open');
//     const arrow = document.querySelector('.arrow')
//     arrow.classList.toggle('right');
//     arrow.classList.toggle('left');
// };

setTimeout(() => {
    document.querySelector('.init-screen').classList.add('hide');
}, 5000);
