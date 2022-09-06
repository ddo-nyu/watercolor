document.querySelector('#brush-size-input').onchange = e => {
    console.log('brush size changed: ', e.target.value);
    r = parseInt(e.target.value);
};

document.querySelectorAll('.brush-color-input').forEach(slider => {
    slider.onchange = e => {
        updateCurrentColor();
    }
})

function updateCurrentColor() {
    const r = document.querySelectorAll('.brush-color-input#r-value')[0].value;
    const g = document.querySelectorAll('.brush-color-input#g-value')[0].value;
    const b = document.querySelectorAll('.brush-color-input#b-value')[0].value;
    const str = `rgba(${r}, ${g}, ${b}, 0.05)`;
    if (str !== currentColor) {
        screenshot();
        currentColor = str;
    }
}

setTimeout(() => {
    document.querySelector('.spotlight')?.classList.add('show');
    setTimeout(() => {
        document.querySelector('.content-container')?.classList.add('show');
        setTimeout(() => {
            document.querySelector('.instruction-container')?.classList.add('show');
            setTimeout(() => {
                document.querySelector('.button-container')?.classList.add('show');
            }, 2000);
        }, 5000);
    }, 3000);
}, 1000);

document.querySelector('#clear-button').onclick = e => {
    location.reload();
};

document.querySelector('#mute-button').onclick = e => {
    currentSound.stop();
    muted = true;
    e.currentTarget.classList.toggle('show');
    document.querySelector('#unmute-button').classList.toggle('show');
};

document.querySelector('#unmute-button').onclick = e => {
    muted = false;
    e.currentTarget.classList.toggle('show');
    document.querySelector('#mute-button').classList.toggle('show');
}

document.querySelector('#continue-button').onclick = e => {
    if (isHandTrackLoaded) {
        startVideo();
        document.querySelector('.init-screen')?.classList.add('hide');
    }
};

document.querySelector('#pause-button').onclick = e => {
    if (isHandTrackLoaded) {
        stopVideo();
    }
};

document.querySelector('#about-button').onclick = e => {
    e.preventDefault();
    document.querySelector('#about')?.classList.add('show');
};

document.querySelector('#close-button').onclick = e => {
    document.querySelector('#about')?.classList.remove('show');
};