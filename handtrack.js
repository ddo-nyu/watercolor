const video = document.getElementById("pose-video");
const canvas = document.querySelector("#pose-canvas");
const context = canvas.getContext("2d");

let isVideo = false;
let model = null;



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

function resizeVideo() {
    video.width = window.innerWidth;
    video.height = window.innerHeight;
}

function startVideo() {
    handTrack.startVideo(video).then(function (status) {
        console.log("video started", status);
        if (status) {
            isVideo = true;
            runDetection();
        }
    });
}

function stopVideo() {
    handTrack.stopVideo(video);
    isVideo = false;
}

let arr = [];

function runDetection() {
    model.detect(video).then((predictions) => {

        const openHands = predictions.filter(p => p.label === 'open');
        if (openHands.length > 0) {
            openHands.forEach(oh => {
                const points = {
                    x: oh.bbox[0] + (oh.bbox[2] / 2),
                    y: oh.bbox[1] + (oh.bbox[3] / 2),
                    color: currentColor,
                    r,
                };
                arrBuffer.push(points);
                // myWorker.postMessage({
                //     x: points.x,
                //     y: points.y,
                //     r: 100,
                //     nsides: 5,
                // });
                // myWorker.onmessage = e => {
                //     fill(currentColor);
                //     draw_stack(e.data);
                // }
            })
        } else {
            arr = [];
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
    resizeVideo();
    startVideo();
});

