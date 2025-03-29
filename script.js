const videoElement = document.getElementById('webcam');
const resultsElement = document.getElementById('detection-result');

const recyclingInfo = {
    'can': { label: 'Can (Recyclable)', bin: 'recycling' },
    'bottle': { label: 'Bottle (Recyclable)', bin: 'recycling' },
    'cup': { label: 'Cup (Recyclable)', bin: 'recycling' },

    'apple': { label: 'Apple (Compost)', bin: 'compost' },
    'pizza': { label: 'Pizza (Compost)', bin: 'compost' },
    'banana': { label: 'Banana (Compost)', bin: 'compost' },
    'orange': { label: 'Orange (Compost)', bin: 'compost' }
};

let activeBinTimeout;

async function setupWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
        return new Promise(resolve => {
            videoElement.onloadedmetadata = () => {
                videoElement.play();
                resolve();
            };
        });
    } catch (err) {
        resultsElement.textContent = "Could not access webcam";
    }
}

async function startDetection() {
    const model = await cocoSsd.load();
    detectObjects(model);
}

async function detectObjects(model) {
    const predictions = await model.detect(videoElement);
    displayResults(predictions);
    requestAnimationFrame(() => detectObjects(model));
}

function displayResults(objects) {
    resultsElement.innerHTML = '';

    const relevantItems = objects.filter(obj => recyclingInfo[obj.class.toLowerCase()]);

    if (relevantItems.length === 0) {
        resultsElement.textContent = "Scan your Trash!";
        resetBinHighlight();
        return;
    }

    clearTimeout(activeBinTimeout);

    relevantItems.forEach(obj => {
        const itemData = recyclingInfo[obj.class.toLowerCase()];
        const item = document.createElement('div');
        item.textContent = `${itemData.label} - ${Math.round(obj.score * 100)}%`;
        resultsElement.appendChild(item);

        const bin = document.getElementById(itemData.bin);
        if (bin) {
            bin.style.backgroundColor = '#FFD700';
        }
    });

    activeBinTimeout = setTimeout(resetBinHighlight, 1000);
}

function resetBinHighlight() {
    document.querySelectorAll('.bin').forEach(bin => bin.style.backgroundColor = '#D9D9D9');
}

setupWebcam().then(startDetection);