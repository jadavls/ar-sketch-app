const webcam = document.getElementById('webcam');
const overlayImg = document.getElementById('overlay-img');
const imageLoader = document.getElementById('image-loader');
const opacitySlider = document.getElementById('opacity-slider');
const opacityVal = document.getElementById('opacity-val');

// ૧. બેક કેમેરા (Rear Camera) શરૂ કરવો
async function startWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" } }, // 'environment' એટલે પાછળનો કેમેરો
            audio: false
        });
        webcam.srcObject = stream;
    } catch (err) {
        console.error("કેમેરા શરૂ કરવામાં ભૂલ આવી: ", err);
        alert("કૃપા કરીને કેમેરાની પરમિશન આપો.");
    }
}

// ૨. યુઝરનો ફોટો લોડ કરવો
imageLoader.addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = function(event) {
        overlayImg.src = event.target.result;
        overlayImg.style.display = 'block';
    }
    reader.readAsDataURL(e.target.files[0]);
});

// ૩. ઓપેસિટી કંટ્રોલ (Opacity Slider)
opacitySlider.addEventListener('input', function(e) {
    const value = e.target.value;
    overlayImg.style.opacity = value;
    opacityVal.innerText = Math.round(value * 100) + "%";
});

// ૪. બ્લેક એન્ડ વ્હાઇટ અને અન્ય ફિલ્ટર્સ
const btnNormal = document.getElementById('btn-normal');
const btnBW = document.getElementById('btn-bw');
const btnInvert = document.getElementById('btn-invert');

function clearActiveFilter() {
    btnNormal.classList.remove('active');
    btnBW.classList.remove('active');
    btnInvert.classList.remove('active');
}

btnNormal.addEventListener('click', () => {
    clearActiveFilter();
    btnNormal.classList.add('active');
    overlayImg.style.filter = 'none';
});

btnBW.addEventListener('click', () => {
    clearActiveFilter();
    btnBW.classList.add('active');
    overlayImg.style.filter = 'grayscale(100%) contrast(150%)'; // B&W સાથે કોન્ટ્રાસ્ટ વધાર્યો જેથી સ્કેચ લાઈનો સ્પષ્ટ દેખાય
});

btnInvert.addEventListener('click', () => {
    clearActiveFilter();
    btnInvert.classList.add('active');
    overlayImg.style.filter = 'invert(100%) grayscale(100%)'; // ડાર્ક રૂમમાં સ્કેચ કરવા માટે બેસ્ટ
});

// એપ લોડ થાય ત્યારે કેમેરા શરૂ કરો
window.addEventListener('load', startWebcam);

// PWA સર્વિસ વર્કર રજીસ્ટ્રેશન
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => console.log("SW Reg Error", err));
}