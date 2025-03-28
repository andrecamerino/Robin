const videoElement = document.getElementById('webcam');
const resultsElement = document.getElementById('detection-result');

const recyclingInfo = {
    'can': 'Can (Recyclable)',
    'bottle': 'Bottle (Recyclable)',
    'cup': 'Cup (Recyclable)', 
    'cup': 'Cup (Recyclable)', 
    
    'apple': 'Apple (Compost)',
    'pizza': 'Pizza (Compost)',
    'banana': 'Banana (Compost)',
    'orange': 'Orange (Compost)'
};

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
    
    const relevantItems = objects.filter(obj => 
        recyclingInfo[obj.class.toLowerCase()]
    );
    
    if (relevantItems.length === 0) {
        resultsElement.textContent = "Scan your Trash!";
        return;
    }
    
    relevantItems.forEach(obj => {
        const item = document.createElement('div');
        item.textContent = `${recyclingInfo[obj.class.toLowerCase()]} - ${Math.round(obj.score * 100)}%`;
        resultsElement.appendChild(item);
    });
}

setupWebcam().then(startDetection);
