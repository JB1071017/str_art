"use strict";

// Global variables
let canvas, ctx;
let processedImageData = null;
let errorArray = [];
let pinCoords = [];
let lineCache = {};
let steps = [];
let currentStepIndex = 0;

// Parameters with defaults
let numPins = 300;
let numChords = 4000;
let lineWeight = 20;
let imgSize = 500;

let darkMode = false;
let currentSessionId = null;
let autoPlayInterval = null;
let isAutoPlaying = false;

let cropper = null;
let croppedImage = null;
let progressBar;

document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});

async function initializeApp() {
    canvas = document.getElementById("art-canvas");
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    progressBar = document.getElementById("progressBar");

    setupEventListeners();
    resizeCanvas();
}

function setupEventListeners() {
    document.getElementById("imageUpload").addEventListener("change", handleImageUpload);
    document.getElementById("initializeBtn").addEventListener("click", initializeGeneration);
    document.getElementById("nextStepBtn").addEventListener("click", nextStep);
    document.getElementById("autoPlayBtn").addEventListener("click", startAutoPlay);
    document.getElementById("stopAutoPlayBtn").addEventListener("click", stopAutoPlay);
    document.getElementById("resetBtn").addEventListener("click", resetGeneration);
    document.getElementById("downloadStepsBtn").addEventListener("click", downloadSteps);
    document.getElementById("downloadSVGBtn").addEventListener("click", downloadSVG);
    document.getElementById("toggleDarkMode").addEventListener("change", toggleDarkMode);

    // Crop modal events
    document.getElementById("cropModal").addEventListener("shown.bs.modal", () => {
        initializeCropper();
    });

    document.getElementById("cropConfirmBtn").addEventListener("click", confirmCrop);

    window.addEventListener("resize", () => {
        if (cropper) cropper.update();
        resizeCanvas();
    });
}

function resizeCanvas() {
    const rightPane = document.querySelector(".col-md-3");
    const rightPaneWidth = rightPane ? rightPane.offsetWidth : 400;
    const availableWidth = window.innerWidth - rightPaneWidth;
    const availableHeight = window.innerHeight;
    const size = Math.max(480, Math.min(availableWidth, availableHeight));
    canvas.width = size;
    canvas.height = size;
    
    const wrapper = document.getElementById("canvas-wrapper");
    wrapper.style.backgroundColor = darkMode ? "#333" : "#fff";
    
    // Redraw current state if we have steps
    if (steps.length > 0) {
        renderAllSteps();
    }
}

function updateProgress(percent) {
    percent = Math.min(100, Math.max(0, percent));
    progressBar.style.width = percent + "%";
    progressBar.textContent = Math.floor(percent) + "%";
}

function updateStepCounter(current, total) {
    document.getElementById("stepCounter").textContent = `${current} / ${total}`;
    updateProgress((current / total) * 100);
}

function toggleDarkMode(event) {
    darkMode = event.target.checked;
    document.documentElement.setAttribute('data-bs-theme', darkMode ? 'dark' : 'light');
    
    const newBgColor = darkMode ? "#333" : "#fff";
    canvas.style.backgroundColor = newBgColor;
    document.getElementById("canvas-wrapper").style.backgroundColor = newBgColor;
    
    // Redraw with new colors
    if (steps.length > 0) {
        renderAllSteps();
    }
}

async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const imageUrl = await readFileAsDataURL(file);
        showCropModal(imageUrl);
    } catch (error) {
        console.error("Error reading file:", error);
        alert("Error reading file");
    }
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
}

function showCropModal(imageUrl) {
    const cropImage = document.getElementById("cropImage");
    cropImage.src = imageUrl;
    const cropModal = new bootstrap.Modal(document.getElementById("cropModal"));
    cropModal.show();
}

function initializeCropper() {
    const cropImage = document.getElementById("cropImage");
    if (cropper) {
        cropper.destroy();
    }
    cropper = new Cropper(cropImage, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 1
    });
}

async function confirmCrop() {
    try {
        const croppedCanvas = cropper.getCroppedCanvas({
            width: imgSize,
            height: imgSize
        });

        const imageDataUrl = croppedCanvas.toDataURL("image/jpeg");
        
        const response = await fetch('/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: imageDataUrl })
        });

        const result = await response.json();
        
        if (result.success) {
            currentSessionId = result.session_id;
            
            croppedImage = new Image();
            croppedImage.src = imageDataUrl;
            croppedImage.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(croppedImage, 0, 0, canvas.width, canvas.height);
            };

            bootstrap.Modal.getInstance(document.getElementById('cropModal')).hide();
            
            // Enable initialize button
            document.getElementById("initializeBtn").disabled = false;
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error("Error during cropping:", error);
        alert("Error during cropping: " + error.message);
    }
}

async function initializeGeneration() {
    if (!croppedImage) {
        alert("Please upload and crop an image first.");
        return;
    }

    numPins = parseInt(document.getElementById("numPins").value) || 300;
    numChords = parseInt(document.getElementById("numChords").value) || 4000;
    lineWeight = parseInt(document.getElementById("lineWeight").value) || 20;

    try {
        const response = await fetch('/initialize_generation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                session_id: currentSessionId,
                numPins: numPins,
                numChords: numChords,
                lineWeight: lineWeight,
                darkMode: darkMode
            })
        });

        const result = await response.json();
        
        if (result.success) {
            // Reset local state
            steps = [];
            currentStepIndex = 0;
            pinCoords = [];
            lineCache = {};
            
            // Initialize string art generation
            initializeStringArt();
            
            // Show step controls
            document.getElementById("stepControls").style.display = "grid";
            document.getElementById("stepInfo").style.display = "block";
            document.getElementById("initializeBtn").disabled = true;
            
            updateStepCounter(0, numChords);
            showMessage("Generation initialized. Click 'Next Step' to start.", "success");
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error("Error initializing generation:", error);
        alert("Error initializing generation: " + error.message);
    }
}

function initializeStringArt() {
    // Create offscreen canvas for processing
    const offCanvas = document.createElement("canvas");
    offCanvas.width = imgSize;
    offCanvas.height = imgSize;
    const offCtx = offCanvas.getContext("2d");
    offCtx.drawImage(croppedImage, 0, 0, imgSize, imgSize);
    processedImageData = offCtx.getImageData(0, 0, imgSize, imgSize);

    // Initialize error array
    errorArray = [];
    for (let i = 0; i < processedImageData.data.length; i += 4) {
        const brightness = processedImageData.data[i];
        errorArray.push(darkMode ? brightness : 255 - brightness);
    }

    // Calculate pin coordinates
    calculatePinCoords();
    
    // Precalculate lines
    precalculateAllPotentialLines();
    
    // Clear canvas and draw initial state
    clearCanvas();
}

function calculatePinCoords() {
    const center = imgSize / 2;
    const radius = center - 1;
    pinCoords = [];
    for (let i = 0; i < numPins; i++) {
        const angle = (2 * Math.PI * i) / numPins;
        const x = Math.floor(center + radius * Math.cos(angle));
        const y = Math.floor(center + radius * Math.sin(angle));
        pinCoords.push({ x, y });
    }
}

function precalculateAllPotentialLines() {
    for (let i = 0; i < numPins; i++) {
        for (let j = i + 1; j < numPins; j++) {
            const dx = pinCoords[j].x - pinCoords[i].x;
            const dy = pinCoords[j].y - pinCoords[i].y;
            const dist = Math.floor(Math.sqrt(dx * dx + dy * dy));
            if (dist < 10) continue;
            const pts = linspacePoints(pinCoords[i], pinCoords[j], dist);
            lineCache[`${i}_${j}`] = pts;
            lineCache[`${j}_${i}`] = pts;
        }
    }
}

function linspacePoints(p0, p1, numPoints) {
    const points = [];
    for (let k = 0; k < numPoints; k++) {
        const t = k / (numPoints - 1);
        const x = Math.floor(p0.x + t * (p1.x - p0.x));
        const y = Math.floor(p0.y + t * (p1.y - p0.y));
        points.push({ x, y });
    }
    return points;
}

async function nextStep() {
    if (currentStepIndex >= numChords) {
        showMessage("All steps completed!", "success");
        return;
    }

    try {
        const response = await fetch('/next_step', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                session_id: currentSessionId
            })
        });

        const result = await response.json();
        
        if (result.success) {
            if (result.completed) {
                showMessage("All steps completed!", "success");
                stopAutoPlay();
                return;
            }

            // Add step to local array and render
            const newStep = result.step;
            steps.push(newStep);
            
            // Calculate the actual best line for this step
            const actualStep = calculateBestNextLine();
            if (actualStep) {
                // Update the step with actual calculated values
                newStep.from = actualStep.from;
                newStep.to = actualStep.to;
                
                // Update error array
                updateErrorArray(actualStep.from, actualStep.to);
                
                // Render the new line
                renderStep(actualStep.from, actualStep.to);
                
                // Update UI
                updateStepInfo(newStep.step_number, actualStep.from, actualStep.to);
                currentStepIndex++;
                updateStepCounter(currentStepIndex, numChords);
                
                // Add visual feedback
                document.getElementById("nextStepBtn").classList.add("step-active");
                setTimeout(() => {
                    document.getElementById("nextStepBtn").classList.remove("step-active");
                }, 500);
            }
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error("Error getting next step:", error);
        alert("Error getting next step: " + error.message);
    }
}

function calculateBestNextLine() {
    if (steps.length === 0) {
        // First step - start from pin 0
        return findBestLineFromPin(0);
    }
    
    const lastStep = steps[steps.length - 1];
    const currentPin = lastStep.to;
    
    return findBestLineFromPin(currentPin);
}

function findBestLineFromPin(currentPin) {
    let bestPin = -1;
    let maxLineError = -1;
    const lastPins = getLastUsedPins(20);

    for (let offset = 1; offset < numPins; offset++) {
        const testPin = (currentPin + offset) % numPins;
        if (lastPins.includes(testPin)) continue;
        
        const key = currentPin < testPin ? `${currentPin}_${testPin}` : `${testPin}_${currentPin}`;
        const pts = lineCache[key];
        if (!pts) continue;
        
        let sumError = 0;
        for (const pt of pts) {
            const idx = pt.y * imgSize + pt.x;
            sumError += errorArray[idx];
        }
        
        if (sumError > maxLineError) {
            maxLineError = sumError;
            bestPin = testPin;
        }
    }

    if (bestPin === -1) {
        // Fallback: use any available pin
        for (let offset = 1; offset < numPins; offset++) {
            const testPin = (currentPin + offset) % numPins;
            const key = currentPin < testPin ? `${currentPin}_${testPin}` : `${testPin}_${currentPin}`;
            if (lineCache[key]) {
                bestPin = testPin;
                break;
            }
        }
    }

    return bestPin !== -1 ? { from: currentPin, to: bestPin } : null;
}

function getLastUsedPins(count) {
    const lastPins = [];
    for (let i = Math.max(0, steps.length - count); i < steps.length; i++) {
        lastPins.push(steps[i].from, steps[i].to);
    }
    return [...new Set(lastPins)]; // Remove duplicates
}

function updateErrorArray(fromPin, toPin) {
    const key = fromPin < toPin ? `${fromPin}_${toPin}` : `${toPin}_${fromPin}`;
    const pts = lineCache[key];
    if (!pts) return;

    for (const pt of pts) {
        const idx = pt.y * imgSize + pt.x;
        errorArray[idx] = Math.max(errorArray[idx] - lineWeight, 0);
    }
}

function renderStep(fromPin, toPin) {
    const scale = canvas.width / imgSize;
    const pFrom = pinCoords[fromPin];
    const pTo = pinCoords[toPin];
    
    ctx.strokeStyle = darkMode ? "rgba(255, 255, 255, 0.5)" : "#000";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(pFrom.x * scale, pFrom.y * scale);
    ctx.lineTo(pTo.x * scale, pTo.y * scale);
    ctx.stroke();
}

function renderAllSteps() {
    clearCanvas();
    
    const scale = canvas.width / imgSize;
    ctx.strokeStyle = darkMode ? "rgba(255, 255, 255, 0.5)" : "#000";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    
    for (const step of steps) {
        const pFrom = pinCoords[step.from];
        const pTo = pinCoords[step.to];
        ctx.moveTo(pFrom.x * scale, pFrom.y * scale);
        ctx.lineTo(pTo.x * scale, pTo.y * scale);
    }
    
    ctx.stroke();
}

function clearCanvas() {
    ctx.fillStyle = darkMode ? "#333" : "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateStepInfo(stepNumber, fromPin, toPin) {
    document.getElementById("currentStepNumber").textContent = stepNumber;
    document.getElementById("fromPin").textContent = fromPin;
    document.getElementById("toPin").textContent = toPin;
}

function startAutoPlay() {
    if (isAutoPlaying) return;
    
    isAutoPlaying = true;
    document.getElementById("autoPlayBtn").style.display = "none";
    document.getElementById("stopAutoPlayBtn").style.display = "block";
    document.getElementById("nextStepBtn").disabled = true;
    
    autoPlayInterval = setInterval(async () => {
        if (currentStepIndex >= numChords) {
            stopAutoPlay();
            showMessage("Auto-play completed all steps!", "success");
            return;
        }
        
        await nextStep();
    }, 50); // 50ms between steps for smooth animation
}

function stopAutoPlay() {
    if (!isAutoPlaying) return;
    
    isAutoPlaying = false;
    clearInterval(autoPlayInterval);
    document.getElementById("autoPlayBtn").style.display = "block";
    document.getElementById("stopAutoPlayBtn").style.display = "none";
    document.getElementById("nextStepBtn").disabled = false;
}

function resetGeneration() {
    stopAutoPlay();
    
    if (confirm("Are you sure you want to reset the generation? All progress will be lost.")) {
        steps = [];
        currentStepIndex = 0;
        errorArray = [];
        lineCache = {};
        
        clearCanvas();
        
        // Re-initialize with the same image
        if (croppedImage) {
            initializeStringArt();
        }
        
        updateStepCounter(0, numChords);
        document.getElementById("stepInfo").style.display = "none";
        document.getElementById("initializeBtn").disabled = false;
        
        showMessage("Generation reset", "info");
    }
}

function showMessage(message, type) {
    const progressMessage = document.getElementById("progressMessage");
    progressMessage.textContent = message;
    progressMessage.className = `text-center small text-${type}`;
    progressMessage.style.display = "block";
    
    setTimeout(() => {
        progressMessage.style.display = "none";
    }, 3000);
}

async function downloadSteps() {
    if (!currentSessionId || steps.length === 0) {
        alert("No steps available to download. Please generate some steps first.");
        return;
    }

    try {
        window.open(`/download/steps?session_id=${currentSessionId}`, '_blank');
    } catch (error) {
        console.error("Error downloading steps:", error);
        alert("Error downloading steps");
    }
}

async function downloadSVG() {
    if (!currentSessionId || steps.length === 0) {
        alert("No SVG available to download. Please generate some steps first.");
        return;
    }

    try {
        window.open(`/download/svg?session_id=${currentSessionId}&darkMode=${darkMode}`, '_blank');
    } catch (error) {
        console.error("Error downloading SVG:", error);
        alert("Error downloading SVG");
    }
}