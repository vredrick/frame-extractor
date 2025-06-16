class DownloadManager {
    constructor() {
        this.frameCollection = [];
        this.maxCollectionSize = 100; // Limit to prevent memory issues
    }

    addToCollection(frameData) {
        if (this.frameCollection.length >= this.maxCollectionSize) {
            this.showError(`Collection full. Maximum ${this.maxCollectionSize} frames allowed.`);
            return false;
        }

        // Add unique ID to frame
        frameData.id = this.generateFrameId();
        frameData.addedAt = Date.now();
        
        this.frameCollection.push(frameData);
        this.updateCollectionUI();
        this.showSuccess('Frame added to collection!');
        
        return true;
    }

    removeFromCollection(frameId) {
        const index = this.frameCollection.findIndex(frame => frame.id === frameId);
        if (index > -1) {
            this.frameCollection.splice(index, 1);
            this.updateCollectionUI();
        }
    }

    clearCollection() {
        if (confirm('Are you sure you want to clear all frames from the collection?')) {
            this.frameCollection = [];
            this.updateCollectionUI();
            this.showSuccess('Collection cleared!');
        }
    }

    async downloadSingleFrame(frameData) {
        const link = document.createElement('a');
        link.href = frameData.dataUrl;
        link.download = this.generateFilename(frameData);
        link.click();
    }

    async downloadCollection() {
        if (this.frameCollection.length === 0) {
            this.showError('No frames in collection to download.');
            return;
        }

        this.showLoading('Preparing ZIP file...');

        try {
            const zip = new JSZip();
            const imagesFolder = zip.folder('extracted-frames');

            // Add each frame to the ZIP
            for (let i = 0; i < this.frameCollection.length; i++) {
                const frame = this.frameCollection[i];
                const filename = this.generateFilename(frame, i + 1);
                
                // Convert data URL to blob
                const response = await fetch(frame.dataUrl);
                const blob = await response.blob();
                
                imagesFolder.file(filename, blob);
                
                // Update loading progress
                const progress = Math.round((i + 1) / this.frameCollection.length * 100);
                this.updateLoadingProgress(`Creating ZIP: ${progress}%`);
            }

            // Generate ZIP file
            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
            }, (metadata) => {
                const progress = Math.round(metadata.percent);
                this.updateLoadingProgress(`Compressing: ${progress}%`);
            });

            // Download the ZIP file
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = `frames_${new Date().toISOString().slice(0, 10)}.zip`;
            link.click();
            
            // Clean up
            URL.revokeObjectURL(link.href);
            this.hideLoading();
            this.showSuccess('ZIP file downloaded successfully!');
            
        } catch (error) {
            console.error('Error creating ZIP:', error);
            this.hideLoading();
            this.showError('Failed to create ZIP file. Please try again.');
        }
    }

    updateCollectionUI() {
        const collectionSection = document.getElementById('collectionSection');
        const collectionGrid = document.getElementById('collectionGrid');
        const frameCount = document.getElementById('frameCount');
        const downloadAllBtn = document.getElementById('downloadAllBtn');

        const emptyState = document.getElementById('emptyState');

        // Show/hide empty state and enable/disable download button
        if (this.frameCollection.length > 0) {
            if (emptyState) emptyState.style.display = 'none';
            downloadAllBtn.disabled = false;
        } else {
            if (emptyState) emptyState.style.display = 'flex';
            downloadAllBtn.disabled = true;
        }

        // Clear existing frame items (but keep empty state)
        const existingItems = collectionGrid.querySelectorAll('.frame-item');
        existingItems.forEach(item => item.remove());

        // Add frame items with staggered animation
        this.frameCollection.forEach((frame, index) => {
            const frameItem = this.createFrameItem(frame, index);
            frameItem.style.animationDelay = `${index * 0.1}s`;
            if (emptyState) {
                collectionGrid.insertBefore(frameItem, emptyState);
            } else {
                collectionGrid.appendChild(frameItem);
            }
        });
    }

    createFrameItem(frame, index) {
        const item = document.createElement('div');
        item.className = 'frame-item';
        item.dataset.frameId = frame.id;

        const img = document.createElement('img');
        img.src = frame.dataUrl;
        img.alt = `Frame ${index + 1}`;
        
        const info = document.createElement('div');
        info.className = 'frame-item-info';
        info.textContent = `${this.formatTimestamp(frame.timestamp)}`;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-frame-btn';
        removeBtn.innerHTML = '×';
        removeBtn.title = 'Remove frame';
        removeBtn.onclick = () => this.removeFromCollection(frame.id);

        item.appendChild(img);
        item.appendChild(info);
        item.appendChild(removeBtn);

        // Add click handler to download individual frame
        img.onclick = () => this.downloadSingleFrame(frame);

        return item;
    }

    generateFrameId() {
        return `frame_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateFilename(frameData, index = null) {
        const timestamp = frameData.timestamp.toFixed(2).replace('.', '-');
        const frameNumber = frameData.frameNumber.toString().padStart(6, '0');
        const indexStr = index ? `_${index.toString().padStart(3, '0')}` : '';
        return `frame${indexStr}_${frameNumber}_${timestamp}s.png`;
    }

    formatTimestamp(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(2);
        return `${mins}:${secs.padStart(5, '0')}`;
    }

    showLoading(message) {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        loadingText.textContent = message;
        overlay.style.display = 'flex';
    }

    updateLoadingProgress(message) {
        const loadingText = document.getElementById('loadingText');
        loadingText.textContent = message;
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.style.display = 'none';
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'error' ? 'var(--danger-color)' : 'var(--primary-color)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
        `;

        // Add animation styles if not already present
        if (!document.querySelector('#notification-animations')) {
            const style = document.createElement('style');
            style.id = 'notification-animations';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Export collection metadata as JSON
    exportCollectionInfo() {
        const info = {
            frameCount: this.frameCollection.length,
            frames: this.frameCollection.map((frame, index) => ({
                index: index + 1,
                timestamp: frame.timestamp,
                frameNumber: frame.frameNumber,
                resolution: `${frame.width}x${frame.height}`,
                filename: this.generateFilename(frame, index + 1)
            }))
        };

        const blob = new Blob([JSON.stringify(info, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'frame_collection_info.json';
        link.click();
        URL.revokeObjectURL(link.href);
    }
}