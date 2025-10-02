// Text to OBJ Generator using Meshy API
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class TextToObjGenerator {
    constructor() {
        this.baseURL = 'https://rcfgpdrrnhltozrnsgic.supabase.co/functions/v1/meshy/';
        this.currentTaskId = null;
        this.pollingInterval = null;
        this.maxPollingAttempts = 60; // 5 minutes with 5-second intervals
        this.pollingAttempts = 0;
        this.viewer3D = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.currentObjUrl = null;
        this.lastRunMode = 'preview';
        this.lastRunPrompt = '';
        this.previewTaskId = null;

        this.initializeUI();
    }

    initializeUI() {
        // Get UI elements
        this.elements = {
            generateBtn: document.getElementById('generateBtn'),
            textPrompt: document.getElementById('textPrompt'),
            charCount: document.getElementById('charCount'),
            artStyle: document.getElementById('artStyle'),
            topology: document.getElementById('topology'),
            apiStatus: document.getElementById('apiStatus'),
            resultsCard: document.getElementById('resultsCard'),
            progressBar: document.getElementById('progressBar'),
            modelPreview: document.getElementById('modelPreview'),
            errorMessage: document.getElementById('errorMessage'),
            taskId: document.getElementById('taskId'),
            modelStatus: document.getElementById('modelStatus'),
            downloadObjBtn: document.getElementById('downloadObjBtn'),
            downloadGlbBtn: document.getElementById('downloadGlbBtn'),
            retryBtn: document.getElementById('retryBtn'),
            errorText: document.getElementById('errorText'),
            progressPercentage: document.getElementById('progressPercentage'),
            refineSection: document.getElementById('refineSection'),
            refinePrompt: document.getElementById('refinePrompt'),
            refineBtn: document.getElementById('refineBtn')
        };

        // Add event listeners
        this.elements.generateBtn.addEventListener('click', () => this.generateModel());
        this.elements.retryBtn.addEventListener('click', () => this.generateModel());
        if (this.elements.refineBtn) {
            this.elements.refineBtn.addEventListener('click', () => this.refineModel());
        }

        // Update button state based on input
        this.elements.textPrompt.addEventListener('input', () => {
            this.updateGenerateButton();
            this.updateCharCount();
        });

        this.updateGenerateButton();
        this.updateCharCount();
    }

    updateCharCount() {
        if (this.elements && this.elements.charCount && this.elements.textPrompt) {
            const count = this.elements.textPrompt.value.length;
            this.elements.charCount.textContent = count;
            console.log('Character count updated:', count);
        }
    }

    updateGenerateButton() {
        if (!this.elements || !this.elements.textPrompt || !this.elements.generateBtn) return;
        
        const hasPrompt = this.elements.textPrompt.value.trim().length > 0;
        this.elements.generateBtn.disabled = !hasPrompt;

        if (!hasPrompt) {
            this.updateStatus('Please enter a text description', 'warning');
        } else {
            this.updateStatus('Ready to generate', 'ready');
        }
    }

    fillPrompt(text) {
        console.log('fillPrompt called with:', text);
        if (this.elements && this.elements.textPrompt) {
            this.elements.textPrompt.value = text;
            this.elements.textPrompt.focus();
            this.updateCharCount();
            this.updateGenerateButton();
            this.elements.textPrompt.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        } else {
            console.error('textPrompt element not found');
        }
    }

    updateStatus(message, type = 'info') {
        this.elements.apiStatus.textContent = message;
        this.elements.apiStatus.className = `status-text status-${type}`;
    }

    async generateModel() {
        if (!this.validateInput()) return;

        try {
            this.setGeneratingState();

            // Step 1: Create generation task
            this.lastRunMode = 'preview';
            this.lastRunPrompt = this.elements.textPrompt.value.trim();
            const taskId = await this.createGenerationTask('preview');
            this.currentTaskId = taskId;
            this.previewTaskId = taskId;  // Save for refine
            this.elements.taskId.textContent = taskId;

            // Step 2: Start polling for results
            this.startPolling();

        } catch (error) {
            console.error('Generation failed:', error);
            this.showError(`Failed to start generation: ${error.message}`);
        }
    }

    async refineModel() {
        const refinePrompt = this.elements.refinePrompt.value.trim();
        
        if (!refinePrompt) {
            alert('Please enter refinement instructions');
            return;
        }

        if (!this.previewTaskId) {
            alert('No preview model found. Please generate a model first.');
            return;
        }
        
        console.log('Refining with preview_task_id:', this.previewTaskId);

        try {
            this.setGeneratingState();
            this.elements.refineSection.style.display = 'none';

            // Create refine task with preview_task_id
            this.lastRunMode = 'refine';
            this.lastRunPrompt = refinePrompt;
            const taskId = await this.createGenerationTask('refine', refinePrompt);
            this.currentTaskId = taskId;
            this.elements.taskId.textContent = taskId;

            // Start polling for refined results
            this.startPolling();

        } catch (error) {
            console.error('Refine failed:', error);
            this.showError(`Failed to refine model: ${error.message}`);
            this.elements.refineSection.style.display = 'block';
        }
    }

    validateInput() {
        const prompt = this.elements.textPrompt.value.trim();

        if (!prompt) {
            this.showError('Please enter a text description');
            return false;
        }

        if (prompt.length < 10) {
            this.showError('Please provide a more detailed description (at least 10 characters)');
            return false;
        }

        return true;
    }

    async createGenerationTask(mode = 'preview', customPrompt = null) {
        const requestBody = {
            mode: mode,
            prompt: customPrompt || this.elements.textPrompt.value.trim(),
            art_style: this.elements.artStyle.value,
            negative_prompt: "low quality, blurry, pixelated, broken, distorted",
            topology: this.elements.topology.value
        };

        // If refining, include the preview_task_id
        if (mode === 'refine' && this.previewTaskId) {
            requestBody.preview_task_id = this.previewTaskId;
            console.log('Sending refine request with preview_task_id:', this.previewTaskId);
            console.log('Full request body:', JSON.stringify(requestBody, null, 2));
        }

        const response = await fetch(this.baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.result;
    }

    startPolling() {
        this.pollingAttempts = 0;
        this.pollingInterval = setInterval(() => {
            this.checkTaskStatus();
        }, 5000); // Check every 5 seconds
    }

    async checkTaskStatus() {
        try {
            this.pollingAttempts++;

            if (this.pollingAttempts >= this.maxPollingAttempts) {
                this.stopPolling();
                this.showError('Generation timeout. Please try again.');
                return;
            }

            const response = await fetch(`${this.baseURL}${this.currentTaskId}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.updateModelStatus(data.status, data.progress);

            if (data.status === 'SUCCEEDED') {
                this.stopPolling();
                this.showResults(data);
            } else if (data.status === 'FAILED') {
                this.stopPolling();
                this.showError('Generation failed. Please try again with a different prompt.');
            }

        } catch (error) {
            console.error('Status check failed:', error);
            this.pollingAttempts--; // Don't count network errors against max attempts
        }
    }

    updateModelStatus(status, progress) {
        this.elements.modelStatus.textContent = status;

        // Update progress bar and percentage
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            let progressValue = 0;
            if (status === 'SUCCEEDED') {
                progressValue = 100;
            } else if (status === 'IN_PROGRESS' && progress) {
                progressValue = progress;
            } else if (status === 'PENDING') {
                progressValue = 10;
            }
            progressFill.style.width = `${progressValue}%`;
            if (this.elements.progressPercentage) {
                this.elements.progressPercentage.textContent = `${progressValue}%`;
            }
        }
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    setGeneratingState() {
        this.elements.generateBtn.disabled = true;
        this.elements.generateBtn.innerHTML = '<span class="btn-icon">⏳</span> Generating...';
        this.updateStatus('Starting generation...', 'generating');

        // Show results card and progress
        this.elements.resultsCard.style.display = 'block';
        this.elements.progressBar.style.display = 'block';
        this.elements.modelPreview.style.display = 'none';
        this.elements.errorMessage.style.display = 'none';

        // Reset progress
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = '0%';
        }
        if (this.elements.progressPercentage) {
            this.elements.progressPercentage.textContent = '0%';
        }
    }

    showResults(data) {
        // Hide progress, show results
        this.elements.progressBar.style.display = 'none';
        this.elements.modelPreview.style.display = 'block';
        this.elements.errorMessage.style.display = 'none';

        // Enable download buttons if URLs are available
        if (data.model_urls) {
            if (data.model_urls.obj) {
                this.elements.downloadObjBtn.disabled = false;
                const proxyUrl = `${this.baseURL}?asset_url=${encodeURIComponent(data.model_urls.obj)}`;
                this.currentObjUrl = proxyUrl;
                this.elements.downloadObjBtn.onclick = () => this.downloadFromUrl(proxyUrl, 'model.obj');
                
                // Load OBJ in 3D viewer
                this.init3DViewer();
                this.load3DModel(proxyUrl);

                // Save result snapshot in history
                this.addToHistory({
                    preview: data.thumbnail_url || null,
                    objUrl: proxyUrl,
                    prompt: this.lastRunMode === 'refine' ? this.lastRunPrompt : this.lastRunPrompt,
                    mode: this.lastRunMode,
                    time: new Date().toLocaleTimeString()
                });
            }
            if (data.model_urls.glb) {
                this.elements.downloadGlbBtn.disabled = false;
                const proxyUrl = `${this.baseURL}?asset_url=${encodeURIComponent(data.model_urls.glb)}`;
                this.elements.downloadGlbBtn.onclick = () => this.downloadFromUrl(proxyUrl, 'model.glb');
            }
        }

        // Show refine section after first preview generation
        if (this.elements.refineSection) {
            this.elements.refineSection.style.display = 'block';
            // Pre-fill with original prompt for easy editing
            if (!this.elements.refinePrompt.value) {
                this.elements.refinePrompt.value = this.elements.textPrompt.value.trim();
            }
        }

        this.resetGenerateButton();
        this.updateStatus('Generation completed successfully!', 'success');
    }

    init3DViewer() {
        if (this.renderer) return; // Already initialized
        
        const canvas = document.getElementById('viewer3d');
        if (!canvas) return;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf8f9fa);

        this.camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        this.camera.position.set(0, 1.5, 3);

        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 10;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight1.position.set(5, 10, 7.5);
        directionalLight1.castShadow = true;
        this.scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight2.position.set(-5, 5, -5);
        this.scene.add(directionalLight2);

        const animate = () => {
            requestAnimationFrame(animate);
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        };
        animate();

        window.addEventListener('resize', () => {
            if (!canvas.clientWidth) return;
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        });
    }

    async load3DModel(url) {
        if (!this.scene) return;

        console.log('Loading 3D model from:', url);

        // Remove old model
        const oldModel = this.scene.getObjectByName('loadedModel');
        if (oldModel) this.scene.remove(oldModel);

        const loader = new OBJLoader();

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const objText = await response.text();
            
            console.log('OBJ data received, parsing...');
            const object = loader.parse(objText);
            object.name = 'loadedModel';

            // Center and scale model
            const box = new THREE.Box3().setFromObject(object);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2 / maxDim;

            object.position.x = -center.x * scale;
            object.position.y = -center.y * scale;
            object.position.z = -center.z * scale;
            object.scale.setScalar(scale);

            // Apply improved material
            object.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({ 
                        color: 0x6a7bfd, 
                        metalness: 0.2, 
                        roughness: 0.5,
                        flatShading: false
                    });
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            this.scene.add(object);
            console.log('3D model loaded successfully');
        } catch (error) {
            console.error('3D Viewer: Failed to load model', error);
            alert('Failed to load 3D preview. You can still download the model files.');
        }
    }

    addToHistory(entry) {
        const container = document.getElementById('resultsHistory');
        if (!container) return;

        const item = document.createElement('div');
        item.className = 'history-item';

        const thumbUrl = entry.preview || '';
        const promptText = entry.prompt || '';

        item.innerHTML = `
            <div class="thumb">
                ${thumbUrl ? `<img src="${thumbUrl}" alt="Preview">` : `<div style="width:120px;height:80px;border:1px dashed #ccc;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#888;">No preview</div>`}
                <div>
                    <div class="history-meta">${entry.time}</div>
                    <div class="history-prompt">${promptText}</div>
                    <div class="history-actions">
                        <button class="btn" onclick="window.open('${entry.objUrl}', '_blank')">Open OBJ URL</button>
                        <button class="btn" onclick="window.textToObjGenerator && window.textToObjGenerator.load3DModel('${entry.objUrl}')">Load in Viewer</button>
                    </div>
                </div>
            </div>
        `;

        container.prepend(item);
    }

    showError(message) {
        this.stopPolling();

        this.elements.progressBar.style.display = 'none';
        this.elements.modelPreview.style.display = 'none';
        this.elements.errorMessage.style.display = 'block';
        this.elements.errorText.textContent = message;

        this.resetGenerateButton();
        this.updateStatus('Generation failed', 'error');
    }

    resetGenerateButton() {
        this.elements.generateBtn.disabled = false;
        this.elements.generateBtn.innerHTML = '<span class="btn-icon">🚀</span> Generate 3D Object';
        this.updateGenerateButton();
    }

    async downloadFromUrl(url, filename) {
        try {
            this.updateStatus('Downloading file...', 'info');

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Download failed');
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(downloadUrl);
            this.updateStatus('File downloaded successfully!', 'success');

        } catch (error) {
            console.error('Download failed:', error);
            this.updateStatus('Download failed. Please try again.', 'error');
        }
    }
}

// Initialize the generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('generateBtn')) {
        window.textToObjGenerator = new TextToObjGenerator();
        console.log('TextToObjGenerator initialized.');
        
        // Make fillPrompt available globally for onclick handlers
        window.fillPrompt = (text) => {
            if (window.textToObjGenerator) {
                window.textToObjGenerator.fillPrompt(text);
            }
        };
    }
});

// Utility functions for the page
window.addEventListener('beforeunload', () => {
    // Clean up polling if user navigates away
    if (window.textToObjGenerator && window.textToObjGenerator.pollingInterval) {
        window.textToObjGenerator.stopPolling();
    }
});