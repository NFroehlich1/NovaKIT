class TextToSvgGenerator {
    constructor() {
        this.baseURL = 'https://rcfgpdrrnhltozrnsgic.supabase.co/functions/v1/svg/';
        this.currentImageId = null;
        this.pollingInterval = null;
        this.maxPollingAttempts = 60; // 5 minutes with 5-second intervals
        this.pollingAttempts = 0;

        this.initializeUI();
    }

    initializeUI() {
        this.elements = {
            generateBtn: document.getElementById('generateBtn'),
            textPrompt: document.getElementById('textPrompt'),
            negativePrompt: document.getElementById('negativePrompt'),
            artStyle: document.getElementById('artStyle'),
            apiStatus: document.getElementById('apiStatus'),
            resultsCard: document.getElementById('resultsCard'),
            progressBar: document.getElementById('progressBar'),
            progressPercentage: document.getElementById('progressPercentage'),
            imagePreview: document.getElementById('imagePreview'),
            previewPlaceholder: document.querySelector('.preview-placeholder'),
            errorMessage: document.getElementById('errorMessage'),
            errorText: document.getElementById('errorText'),
            downloadSvgBtn: document.getElementById('downloadSvgBtn'),
            downloadPngBtn: document.getElementById('downloadPngBtn'),
            retryBtn: document.getElementById('retryBtn'),
        };

        this.elements.generateBtn.addEventListener('click', () => this.generateImage());
        this.elements.retryBtn.addEventListener('click', () => this.generateImage());
        this.elements.textPrompt.addEventListener('input', () => this.updateGenerateButton());

        this.updateGenerateButton();
    }

    updateGenerateButton() {
        const hasPrompt = this.elements.textPrompt.value.trim().length > 0;
        this.elements.generateBtn.disabled = !hasPrompt;
        if (!hasPrompt) {
            this.updateStatus('Enter a prompt to begin', 'warning');
        } else {
            this.updateStatus('Ready to generate', 'ready');
        }
    }

    updateStatus(message, type = 'info') {
        this.elements.apiStatus.textContent = message;
        this.elements.apiStatus.className = `status-text status-${type}`;
    }

    async generateImage() {
        if (this.elements.textPrompt.value.trim().length < 3) {
            this.showError("Please enter a more descriptive prompt (at least 3 characters).");
            return;
        }

        this.setGeneratingState();

        const requestBody = {
            prompt: this.elements.textPrompt.value.trim(),
            negativePrompt: this.elements.negativePrompt.value.trim(),
            style: this.elements.artStyle.value,
        };

        try {
            const response = await fetch(`${this.baseURL}generate-image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to start generation.');
            }

            // The API returns the final image data directly, no polling needed.
            this.showResults(data.data[0]);

        } catch (error) {
            console.error('Generation failed:', error);
            this.showError(`Generation failed: ${error.message}`);
        }
    }

    setGeneratingState() {
        this.elements.generateBtn.disabled = true;
        this.elements.generateBtn.innerHTML = '<span class="btn-icon">⏳</span> Generating...';
        this.updateStatus('Generating your SVG...', 'generating');

        this.elements.resultsCard.style.display = 'block';
        this.elements.progressBar.style.display = 'block';
        this.elements.imagePreview.style.display = 'none';
        this.elements.errorMessage.style.display = 'none';

        const progressFill = this.elements.progressBar.querySelector('.progress-fill');
        progressFill.style.width = '50%';
        this.elements.progressPercentage.textContent = 'Generating...';
    }

    showResults(data) {
        this.elements.progressBar.style.display = 'none';
        this.elements.imagePreview.style.display = 'block';
        this.elements.errorMessage.style.display = 'none';

        this.elements.previewPlaceholder.innerHTML = `<img src="${data.pngUrl}" alt="Generated SVG">`;

        // Setup download buttons
        this.elements.downloadSvgBtn.disabled = false;
        this.elements.downloadPngBtn.disabled = false;

        const svgProxyUrl = `${this.baseURL}?asset_url=${encodeURIComponent(data.svgUrl)}`;
        const pngProxyUrl = `${this.baseURL}?asset_url=${encodeURIComponent(data.pngUrl)}`;

        this.elements.downloadSvgBtn.onclick = () => this.downloadFromUrl(svgProxyUrl, 'image.svg');
        this.elements.downloadPngBtn.onclick = () => this.downloadFromUrl(pngProxyUrl, 'image.png');

        this.resetGenerateButton();
        this.updateStatus('SVG generated successfully!', 'success');
    }

    showError(message) {
        this.elements.progressBar.style.display = 'none';
        this.elements.imagePreview.style.display = 'none';
        this.elements.errorMessage.style.display = 'block';
        this.elements.errorText.textContent = message;

        this.resetGenerateButton();
        this.updateStatus('Generation failed', 'error');
    }

    resetGenerateButton() {
        this.elements.generateBtn.disabled = false;
        this.elements.generateBtn.innerHTML = '<span class="btn-icon">🚀</span> Generate SVG';
        this.updateGenerateButton();
    }

    async downloadFromUrl(url, filename) {
        try {
            this.updateStatus(`Downloading ${filename}...`, 'info');
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Download failed: ${response.statusText}`);
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
            this.updateStatus('Download complete!', 'success');
        } catch (error) {
            console.error('Download error:', error);
            this.showError(`Could not download file. ${error.message}`);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.textToSvgGenerator = new TextToSvgGenerator();
});
