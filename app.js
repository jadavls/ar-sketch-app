const webcam = document.getElementById('webcam');
const overlayImg = document.getElementById('overlay-img');
const imageLoader = document.getElementById('image-loader');
const opacitySlider = document.getElementById('opacity-slider');
const opacityVal = document.getElementById('opacity-val');

// કેમેરા શરૂ કરવો
async function startWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" } }, 
            audio: false
        });
        webcam.srcObject = stream;
    } catch (err) {
        console.error("કેમેરા એરર: ", err);
    }
}

// ફોટો અપલોડ
imageLoader.addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = function(event) {
        overlayImg.src = event.target.result;
        overlayImg.style.display = 'block';
        
        // ફોટો અપલોડ થાય ત્યારે સ્ક્રીનની વચ્ચે સેટ કરવો
        resetImagePosition();
    }
    reader.readAsDataURL(e.target.files[0]);
});

// ઓપેસિટી કંટ્રોલ
opacitySlider.addEventListener('input', function(e) {
    const value = e.target.value;
    overlayImg.style.opacity = value;
    opacityVal.innerText = Math.round(value * 100) + "%";
});

// બ્લેક એન્ડ વ્હાઇટ ફિલ્ટર્સ
const buttons = {
    'btn-normal': 'none',
    'btn-bw': 'grayscale(100%) contrast(160%)',
    '===btn-invert===': 'invert(100%) grayscale(100%)' // નીચે એડજસ્ટ કર્યું છે
};

document.getElementById('btn-normal').addEventListener('click', (e) => setFilter(e.target, 'none'));
document.getElementById('btn-bw').addEventListener('click', (e) => setFilter(e.target, 'grayscale(100%) contrast(170%)'));
document.getElementById('btn-invert').addEventListener('click', (e) => setFilter(e.target, 'invert(100%) grayscale(100%)'));

function setFilter(element, filterValue) {
    document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
    element.classList.add('active');
    overlayImg.style.filter = filterValue;
}


// --- ફોટો એડજસ્ટમેન્ટ લોજિક (MOVE, ZOOM & ROTATE) ---

let transform = { x: 0, y: 0, scale: 1, angle: 0 };
let startTouch = { x: 0, y: 0 };
let startDist = 0;
let startAngle = 0;
let isDragging = false;
let isPinching = false;

function resetImagePosition() {
    const container = document.querySelector('.canvas-container');
    transform = {
        x: (container.clientWidth - 250) / 2,
        y: (container.clientHeight - 250) / 2,
        scale: 1,
        angle: 0
    };
    updateTransform();
}

function updateTransform() {
    overlayImg.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale}) rotate(${transform.angle}deg)`;
}

// બે આંગળી વચ્ચેનું અંતર માપવા માટે
function getDistance(t1, t2) {
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
}

// બે આંગળી વચ્ચેનો એન્ગલ માપવા માટે
function getAngle(t1, t2) {
    return Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * 180 / Math.PI;
}

// ટચ શરૂ થાય ત્યારે
overlayImg.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        isDragging = true;
        startTouch.x = e.touches[0].clientX - transform.x;
        startTouch.y = e.touches[0].clientY - transform.y;
    } else if (e.touches.length === 2) {
        isDragging = false;
        isPinching = true;
        startDist = getDistance(e.touches[0], e.touches[1]);
        startAngle = getAngle(e.touches[0], e.touches[1]);
    }
});

// આંગળી સ્ક્રીન પર ઘસાય ત્યારે
overlayImg.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
        transform.x = e.touches[0].clientX - startTouch.x;
        transform.y = e.touches[0].clientY - startTouch.y;
        updateTransform();
    } else if (isPinching && e.touches.length === 2) {
        // ઝૂમ (Scale) લોજિક
        const currentDist = getDistance(e.touches[0], e.touches[1]);
        const scaleFactor = currentDist / startDist;
        transform.scale = Math.max(0.2, Math.min(transform.scale * scaleFactor, 5)); // મિનિમમ ૦.૨ અને મેક્સિમમ ૫ ગણું ઝૂમ
        startDist = currentDist;

        // રોટેટ (Rotate) લોજિક
        const currentAngle = getAngle(e.touches[0], e.touches[1]);
        transform.angle += (currentAngle - startAngle);
        startAngle = currentAngle;

        updateTransform();
    }
});

// ટચ પૂરો થાય ત્યારે
overlayImg.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) {
        isDragging = false;
        isPinching = false;
    } else if (e.touches.length === 1) {
        isDragging = true;
        isPinching = false;
        // બાકી રહેલી એક આંગળી માટે પોઝિશન રીસેટ કરવી
        startTouch.x = e.touches[0].clientX - transform.x;
        startTouch.y = e.touches[0].clientY - transform.y;
    }
});

window.addEventListener('load', startWebcam);

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => console.log(err));
}
