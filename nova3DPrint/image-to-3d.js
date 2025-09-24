class ImageTo3DGenerator {
  constructor() {
    // Use deployed Supabase Edge Function name (see Supabase dashboard → Edge Functions)
    // The function is named "meshy-image" in the current project.
    this.baseURL = 'https://rcfgpdrrnhltozrnsgic.supabase.co/functions/v1/meshy-image/';
    this.currentTaskId = null;
    this.pollingInterval = null;
    this.maxPollingAttempts = 60;
    this.pollingAttempts = 0;

    this.elements = {
      imageInput: document.getElementById('imageInput'),
      generateBtn: document.getElementById('generateImgBtn'),
      artStyle: document.getElementById('artStyleImg'),
      topology: document.getElementById('topologyImg'),
      apiStatus: document.getElementById('apiStatusImg'),
      resultsCard: document.getElementById('resultsCardImg'),
      progressBar: document.getElementById('progressBarImg'),
      modelPreview: document.getElementById('modelPreviewImg'),
      errorMessage: document.getElementById('errorMessageImg'),
      taskId: document.getElementById('taskIdImg'),
      modelStatus: document.getElementById('modelStatusImg'),
      downloadObjBtn: document.getElementById('downloadObjBtnImg'),
      downloadGlbBtn: document.getElementById('downloadGlbBtnImg'),
      retryBtn: document.getElementById('retryBtnImg'),
      progressPercentage: document.getElementById('progressPercentageImg')
    };

    this.elements.imageInput.addEventListener('change', () => this.updateState());
    this.elements.generateBtn.addEventListener('click', () => this.generate());
    this.elements.retryBtn.addEventListener('click', () => this.generate());

    this.updateState();
  }

  updateState() {
    const hasFile = this.elements.imageInput.files && this.elements.imageInput.files.length > 0;
    this.elements.generateBtn.disabled = !hasFile;
    this.updateStatus(hasFile ? 'Ready to generate' : 'Please upload an image to begin', hasFile ? 'ready' : 'warning');
  }

  updateStatus(message, type = 'info') {
    this.elements.apiStatus.textContent = message;
    this.elements.apiStatus.className = `status-text status-${type}`;
  }

  async generate() {
    const file = this.elements.imageInput.files?.[0];
    if (!file) return;
    try {
      this.setGenerating();
      const imageBase64 = await this.readAsBase64(file);
      const requestBody = {
        mode: 'preview',
        // Meshy accepts either an accessible URL or base64 data in some plans.
        // Send both keys so the Edge Function can forward what the API accepts.
        image_url: imageBase64,
        image: imageBase64,
        art_style: this.elements.artStyle.value,
        topology: this.elements.topology.value
      };
      const res = await fetch(this.baseURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      if (!res.ok) throw new Error('Failed to start generation');
      const data = await res.json();
      this.currentTaskId = data.result || data.task_id || data.id;
      this.elements.taskId.textContent = this.currentTaskId;
      this.startPolling();
    } catch (e) {
      this.showError(e.message || 'Generation failed');
    }
  }

  readAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  startPolling() {
    this.pollingAttempts = 0;
    this.pollingInterval = setInterval(() => this.checkStatus(), 5000);
  }

  async checkStatus() {
    try {
      this.pollingAttempts++;
      if (this.pollingAttempts >= this.maxPollingAttempts) {
        this.stopPolling();
        return this.showError('Generation timeout. Please try again.');
      }
      let res = await fetch(`${this.baseURL}${this.currentTaskId}`);
      // If the function returns non-OK, retry once after a short delay
      if (!res.ok) {
        await new Promise(r => setTimeout(r, 1500));
        res = await fetch(`${this.baseURL}${this.currentTaskId}`);
      }
      if (!res.ok) throw new Error('Status check failed');
      const data = await res.json();
      this.updateProgress(data.status, data.progress);
      if (data.status === 'SUCCEEDED') {
        this.stopPolling();
        this.showResults(data);
      } else if (data.status === 'FAILED') {
        this.stopPolling();
        this.showError('Generation failed. Please try another image.');
      }
    } catch (e) {
      console.error(e);
      this.pollingAttempts--; // ignore transient error
    }
  }

  updateProgress(status, progress) {
    this.elements.modelStatus.textContent = status;
    const progressFill = document.querySelector('.progress-fill');
    if (!progressFill) return;
    let value = 0;
    if (status === 'SUCCEEDED') value = 100;
    else if (status === 'IN_PROGRESS' && progress) value = progress;
    else if (status === 'PENDING') value = 10;
    progressFill.style.width = `${value}%`;
    if (this.elements.progressPercentage) this.elements.progressPercentage.textContent = `${value}%`;
  }

  stopPolling() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    this.pollingInterval = null;
  }

  setGenerating() {
    this.elements.generateBtn.disabled = true;
    this.elements.generateBtn.innerHTML = '<span class="btn-icon">⏳</span> Generating...';
    this.updateStatus('Starting generation...', 'generating');
    this.elements.resultsCard.style.display = 'block';
    this.elements.progressBar.style.display = 'block';
    this.elements.modelPreview.style.display = 'none';
    this.elements.errorMessage.style.display = 'none';
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) progressFill.style.width = '0%';
    if (this.elements.progressPercentage) this.elements.progressPercentage.textContent = '0%';
  }

  showResults(data) {
    this.elements.progressBar.style.display = 'none';
    this.elements.modelPreview.style.display = 'block';
    this.elements.errorMessage.style.display = 'none';
    if (data.model_urls) {
      if (data.model_urls.obj) {
        this.elements.downloadObjBtn.disabled = false;
        const proxyUrl = `${this.baseURL}?asset_url=${encodeURIComponent(data.model_urls.obj)}`;
        this.elements.downloadObjBtn.onclick = () => this.download(proxyUrl, 'model.obj');
      }
      if (data.model_urls.glb) {
        this.elements.downloadGlbBtn.disabled = false;
        const proxyUrl = `${this.baseURL}?asset_url=${encodeURIComponent(data.model_urls.glb)}`;
        this.elements.downloadGlbBtn.onclick = () => this.download(proxyUrl, 'model.glb');
      }
    }
    if (data.thumbnail_url) {
      const preview = document.querySelector('.preview-placeholder');
      if (preview) preview.innerHTML = `<img src="${data.thumbnail_url}" alt="Generated 3D Model" style="max-width:100%;height:auto;border-radius:8px;"/>`;
    }
    this.elements.generateBtn.disabled = false;
    this.elements.generateBtn.innerHTML = '<span class="btn-icon">🚀</span> Generate 3D Object';
    this.updateState();
    this.updateStatus('Generation completed successfully!', 'success');
  }

  showError(msg) {
    this.elements.progressBar.style.display = 'none';
    this.elements.modelPreview.style.display = 'none';
    this.elements.errorMessage.style.display = 'block';
    this.elements.errorText.textContent = msg;
    this.elements.generateBtn.disabled = false;
    this.elements.generateBtn.innerHTML = '<span class="btn-icon">🚀</span> Generate 3D Object';
    this.updateStatus('Generation failed', 'error');
  }

  async download(url, filename) {
    try {
      this.updateStatus('Downloading file...', 'info');
      const res = await fetch(url);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const dl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dl; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(dl);
      this.updateStatus('File downloaded successfully!', 'success');
    } catch {
      this.updateStatus('Download failed. Please try again.', 'error');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('generateImgBtn')) {
    window.imageTo3DGenerator = new ImageTo3DGenerator();
  }
});


