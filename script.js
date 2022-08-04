document.querySelector('#brush-size-input').onchange = e => {
    console.log('brush size changed: ', e.target.value);
    r = parseInt(e.target.value);
};

document.querySelectorAll('.brush-color').forEach(slider => {
    slider.onchange = e => {
        updateCurrentColor();
    }
})

function updateCurrentColor() {
    const r = document.querySelectorAll('.brush-color#r-value')[0].value;
    const g = document.querySelectorAll('.brush-color#g-value')[0].value;
    const b = document.querySelectorAll('.brush-color#b-value')[0].value;
    const str = `rgba(${r}, ${g}, ${b}, 0.05)`;
    if (str !== currentColor) {
        screenshot();
        currentColor = str;
    }
}

setTimeout(() => {
    document.querySelector('.init-screen')?.classList.add('hide');
}, 5000);

document.querySelector('#clear-button').onclick = e => {
    location.reload();
};

