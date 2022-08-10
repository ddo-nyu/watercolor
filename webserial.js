const serial = new p5.WebSerial();

function webSerialSetup() {
    // check to see if serial is available:
    if (!navigator.serial) {
        // alert("WebSerial is not supported in this browser. Try Chrome or MS Edge.");
    }
    // check for any ports that are available:
    serial.getPorts();
    // if there's no port chosen, choose one:
    serial.on("noport", portError);
    // open whatever port is available:
    serial.on("portavailable", openPort);
    // handle serial errors:
    serial.on("requesterror", portError);
    // handle any incoming serial data:
    serial.on("data", serialEvent);
    // serial.on("close", makePortButton)

    // add serial connect/disconnect listeners from WebSerial API:
    navigator?.serial?.addEventListener("connect", portConnect);
    navigator?.serial?.addEventListener("disconnect", portDisconnect);
}

function choosePort() {
    serial.requestPort();
}

function openPort() {
    // wait for the serial.open promise to return,
    // then call the initiateSerial function
    serial.open()
        .then(initiateSerial);

    // once the port opens, let the user know:
    function initiateSerial() {
        console.log("port open");
    }
    // hide the port button once a port is chosen:
    // if (portButton) portButton.hide();
}

function portError(err) {
    console.error("Serial port error: " + err);
    document.querySelectorAll('.control-panel .brush-color').forEach(brushInput => {
        brushInput.classList.add('show');
    });
}

function serialEvent() {
    const rgbValue = serial.readLine();
    if (rgbValue) {
        const rgbArr = parseData(rgbValue);
        const str = `rgba(${rgbArr[0]}, ${rgbArr[1]}, ${rgbArr[2]}, 0.05)`;
        if (str !== currentColor) {
            screenshot();
            currentColor = str;
        }
    }
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