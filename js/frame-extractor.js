class FrameExtractor {
    constructor() {
        this.canvas = null;
        this.context = null;
        this.extractedFrames = [];
        this.thumbnailSize = { width: 300, height: 200 };
    }

    init(canvasElement) {
        this.canvas = canvasElement;
        this.context = this.canvas.getContext('2d');
    }

    captureCurrentFrame(videoElement) {
        if (!videoElement || videoElement.readyState < 2) {
            console.error('Video not ready for frame capture');
            return null;
        }

        // Set canvas dimensions to match video
        this.canvas.width = videoElement.videoWidth;
        this.canvas.height = videoElement.videoHeight;

        // Draw the current video frame to canvas
        this.context.drawImage(videoElement, 0, 0, this.canvas.width, this.canvas.height);

        // Create frame data object
        const frameData = {
            timestamp: videoElement.currentTime,
            frameNumber: Math.floor(videoElement.currentTime * 30), // Assuming 30fps
            width: this.canvas.width,
            height: this.canvas.height,
            dataUrl: this.canvas.toDataURL('image/png', 1.0)
        };

        return frameData;
    }

    async captureFrameAsBlob(videoElement) {
        const frameData = this.captureCurrentFrame(videoElement);
        if (!frameData) return null;

        return new Promise((resolve) => {
            this.canvas.toBlob((blob) => {
                resolve({
                    ...frameData,
                    blob: blob
                });
            }, 'image/png', 1.0);
        });
    }

    generateThumbnail(frameData) {
        // Create a temporary canvas for thumbnail
        const thumbCanvas = document.createElement('canvas');
        const thumbContext = thumbCanvas.getContext('2d');

        // Calculate thumbnail dimensions maintaining aspect ratio
        const aspectRatio = frameData.width / frameData.height;
        let thumbWidth = this.thumbnailSize.width;
        let thumbHeight = this.thumbnailSize.height;

        if (aspectRatio > thumbWidth / thumbHeight) {
            thumbHeight = thumbWidth / aspectRatio;
        } else {
            thumbWidth = thumbHeight * aspectRatio;
        }

        thumbCanvas.width = thumbWidth;
        thumbCanvas.height = thumbHeight;

        // Create image from frame data
        const img = new Image();
        img.onload = () => {
            thumbContext.drawImage(img, 0, 0, thumbWidth, thumbHeight);
        };
        img.src = frameData.dataUrl;

        return {
            url: thumbCanvas.toDataURL('image/png', 0.8),
            width: thumbWidth,
            height: thumbHeight
        };
    }

    createDownloadLink(frameData, filename) {
        const link = document.createElement('a');
        link.href = frameData.dataUrl;
        link.download = filename || this.generateFilename(frameData);
        return link;
    }

    generateFilename(frameData) {
        const timestamp = frameData.timestamp.toFixed(2).replace('.', '-');
        const frameNumber = frameData.frameNumber.toString().padStart(6, '0');
        return `frame_${frameNumber}_${timestamp}s.png`;
    }

    async downloadFrame(videoElement) {
        const frameData = await this.captureFrameAsBlob(videoElement);
        if (!frameData) return;

        const link = this.createDownloadLink(frameData);
        link.click();

        // Update UI to show download initiated
        this.showDownloadFeedback('Frame downloaded successfully!');
    }

    updateFramePreview(videoElement) {
        const frameData = this.captureCurrentFrame(videoElement);
        if (!frameData) return;

        const previewImg = document.getElementById('framePreview');
        const frameInfo = document.getElementById('frameInfo');

        // Update preview image
        previewImg.src = frameData.dataUrl;
        previewImg.style.display = 'block';

        // Update frame information
        const timeStr = this.formatTimestamp(frameData.timestamp);
        const infoHtml = `
            <div>Time: ${timeStr}</div>
            <div>Frame: ${frameData.frameNumber}</div>
            <div>Resolution: ${frameData.width} × ${frameData.height}</div>
        `;
        frameInfo.innerHTML = infoHtml;
    }

    formatTimestamp(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(2);
        return `${mins}:${secs.padStart(5, '0')}`;
    }

    showDownloadFeedback(message) {
        // Create temporary feedback element
        const feedback = document.createElement('div');
        feedback.className = 'download-feedback';
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(feedback);

        // Remove after 3 seconds
        setTimeout(() => {
            feedback.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(feedback);
            }, 300);
        }, 3000);
    }

    // Batch processing methods for collections
    async extractMultipleFrames(videoElement, timestamps) {
        const frames = [];
        const originalTime = videoElement.currentTime;

        for (const timestamp of timestamps) {
            videoElement.currentTime = timestamp;
            await this.waitForSeek(videoElement);
            
            const frameData = await this.captureFrameAsBlob(videoElement);
            if (frameData) {
                frames.push(frameData);
            }
        }

        // Restore original time
        videoElement.currentTime = originalTime;
        return frames;
    }

    waitForSeek(videoElement) {
        return new Promise((resolve) => {
            const checkSeek = () => {
                if (videoElement.seeking) {
                    requestAnimationFrame(checkSeek);
                } else {
                    resolve();
                }
            };
            checkSeek();
        });
    }

    // Utility method to get video snapshot at specific time
    async getFrameAtTime(videoElement, timestamp) {
        const originalTime = videoElement.currentTime;
        videoElement.currentTime = timestamp;
        
        await this.waitForSeek(videoElement);
        const frameData = await this.captureFrameAsBlob(videoElement);
        
        videoElement.currentTime = originalTime;
        return frameData;
    }
}