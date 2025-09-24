// Text to OBJ Generator using Meshy API
class TextToObjGenerator {
    constructor() {
        this.baseURL = 'https://rcfgpdrrnhltozrnsgic.supabase.co/functions/v1/meshy/';
        this.currentTaskId = null;
        this.pollingInterval = null;
        this.maxPollingAttempts = 60; // 5 minutes with 5-second intervals
        this.pollingAttempts = 0;

        this.initializeUI();
        window.fillPrompt = this.fillPrompt.bind(this);
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
            progressPercentage: document.getElementById('progressPercentage')
        };

        // Add event listeners
        this.elements.generateBtn.addEventListener('click', () => this.generateModel());
        this.elements.retryBtn.addEventListener('click', () => this.generateModel());

        // Update button state based on input
        this.elements.textPrompt.addEventListener('input', () => {
            this.updateGenerateButton();
            this.updateCharCount();
        });

        this.updateGenerateButton();
        this.updateCharCount();
    }

    updateCharCount() {
        if (this.elements.charCount && this.elements.textPrompt) {
            this.elements.charCount.textContent = this.elements.textPrompt.value.length;
        }
    }

    updateGenerateButton() {
        const hasPrompt = this.elements.textPrompt.value.trim().length > 0;
        this.elements.generateBtn.disabled = !hasPrompt;

        if (!hasPrompt) {
            this.updateStatus('Please enter a text description', 'warning');
        } else {
            this.updateStatus('Ready to generate', 'ready');
        }
    }

    fillPrompt(text) {
        if (this.elements.textPrompt) {
            this.elements.textPrompt.value = text;
            this.updateCharCount();
            this.updateGenerateButton();
            this.elements.textPrompt.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
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
            const taskId = await this.createGenerationTask();
            this.currentTaskId = taskId;
            this.elements.taskId.textContent = taskId;

            // Step 2: Start polling for results
            this.startPolling();

        } catch (error) {
            console.error('Generation failed:', error);
            this.showError(`Failed to start generation: ${error.message}`);
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

    async createGenerationTask() {
        const requestBody = {
            mode: "preview",  // or "refine" for higher quality
            prompt: this.elements.textPrompt.value.trim(),
            art_style: this.elements.artStyle.value,
            negative_prompt: "low quality, blurry, pixelated, broken, distorted",
            topology: this.elements.topology.value
        };

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
                this.elements.downloadObjBtn.onclick = () => this.downloadFromUrl(proxyUrl, 'model.obj');
            }
            if (data.model_urls.glb) {
                this.elements.downloadGlbBtn.disabled = false;
                const proxyUrl = `${this.baseURL}?asset_url=${encodeURIComponent(data.model_urls.glb)}`;
                this.elements.downloadGlbBtn.onclick = () => this.downloadFromUrl(proxyUrl, 'model.glb');
            }
        }

        // Update preview with thumbnail if available
        if (data.thumbnail_url) {
            const previewPlaceholder = document.querySelector('.preview-placeholder');
            if (previewPlaceholder) {
                previewPlaceholder.innerHTML = `
                    <img src="${data.thumbnail_url}" alt="Generated 3D Model" style="max-width: 100%; height: auto; border-radius: 8px;">
                    <p>Model generated successfully!</p>
                `;
            }
        }

        this.resetGenerateButton();
        this.updateStatus('Generation completed successfully!', 'success');
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
    }
});

// Utility functions for the page
window.addEventListener('beforeunload', () => {
    // Clean up polling if user navigates away
    if (window.textToObjGenerator && window.textToObjGenerator.pollingInterval) {
        window.textToObjGenerator.stopPolling();
    }
});