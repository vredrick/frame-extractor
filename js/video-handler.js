class VideoHandler {
    constructor() {
        this.videoElement = null;
        this.currentVideo = null;
        this.duration = 0;
        this.isPlaying = false;
        this.frameRate = 30; // Default frame rate
    }

    init(videoElement) {
        this.videoElement = videoElement;
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.videoElement.addEventListener('loadedmetadata', () => {
            this.duration = this.videoElement.duration;
            this.updateDurationDisplay();
            this.detectFrameRate();
        });

        this.videoElement.addEventListener('timeupdate', () => {
            this.updateTimeDisplay();
            this.updateTimeline();
        });

        this.videoElement.addEventListener('play', () => {
            this.isPlaying = true;
            this.updatePlayPauseButton();
        });

        this.videoElement.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updatePlayPauseButton();
        });

        this.videoElement.addEventListener('ended', () => {
            this.isPlaying = false;
            this.updatePlayPauseButton();
        });
    }

    async handleFileUpload(file) {
        if (!this.validateFile(file)) {
            return false;
        }

        try {
            const url = URL.createObjectURL(file);
            this.currentVideo = {
                file: file,
                url: url,
                name: file.name
            };
            
            this.videoElement.src = url;
            await this.videoElement.load();
            
            return true;
        } catch (error) {
            console.error('Error loading video:', error);
            this.showError('Failed to load video file');
            return false;
        }
    }

    validateFile(file) {
        const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
        const maxSize = 100 * 1024 * 1024; // 100MB

        if (!validTypes.includes(file.type)) {
            this.showError('Invalid file type. Please upload MP4, WebM, MOV, or AVI files.');
            return false;
        }

        if (file.size > maxSize) {
            this.showError('File too large. Maximum size is 100MB.');
            return false;
        }

        return true;
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = message;
        errorElement.classList.add('show');
        
        setTimeout(() => {
            errorElement.classList.remove('show');
        }, 5000);
    }

    play() {
        if (this.videoElement && this.videoElement.paused) {
            this.videoElement.play();
        }
    }

    pause() {
        if (this.videoElement && !this.videoElement.paused) {
            this.videoElement.pause();
        }
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    seekToTime(time) {
        if (this.videoElement) {
            this.videoElement.currentTime = time;
        }
    }

    seekToPercent(percent) {
        const time = (percent / 100) * this.duration;
        this.seekToTime(time);
    }

    seekByFrames(frames) {
        const frameDuration = 1 / this.frameRate;
        const currentTime = this.videoElement.currentTime;
        const newTime = currentTime + (frames * frameDuration);
        
        // Clamp to video bounds
        const clampedTime = Math.max(0, Math.min(newTime, this.duration));
        this.seekToTime(clampedTime);
    }

    nextFrame() {
        this.pause();
        this.seekByFrames(1);
    }

    previousFrame() {
        this.pause();
        this.seekByFrames(-1);
    }

    updateTimeDisplay() {
        const currentTime = this.videoElement.currentTime;
        const currentTimeStr = this.formatTime(currentTime);
        document.getElementById('currentTime').textContent = currentTimeStr;
    }

    updateDurationDisplay() {
        const durationStr = this.formatTime(this.duration);
        document.getElementById('totalTime').textContent = durationStr;
    }

    updateTimeline() {
        const percent = (this.videoElement.currentTime / this.duration) * 100;
        const timeline = document.getElementById('timeline');
        const progress = document.getElementById('timelineProgress');
        
        timeline.value = percent;
        progress.style.width = `${percent}%`;
    }

    updatePlayPauseButton() {
        const playIcon = document.querySelector('.play-icon');
        const pauseIcon = document.querySelector('.pause-icon');
        
        if (this.isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    detectFrameRate() {
        // Try to detect frame rate from video metadata
        // This is a simplified approach - real frame rate detection is complex
        if (this.videoElement.videoWidth && this.videoElement.videoHeight) {
            // Common frame rates based on resolution
            const width = this.videoElement.videoWidth;
            const height = this.videoElement.videoHeight;
            
            // Default to 30fps for most videos
            this.frameRate = 30;
            
            // Adjust for common formats
            if (width === 1920 && height === 1080) {
                this.frameRate = 30; // Common for 1080p
            } else if (width === 3840 && height === 2160) {
                this.frameRate = 60; // Common for 4K
            }
        }
    }

    getCurrentFrameNumber() {
        return Math.floor(this.videoElement.currentTime * this.frameRate);
    }

    getTotalFrames() {
        return Math.floor(this.duration * this.frameRate);
    }

    getVideoInfo() {
        return {
            name: this.currentVideo?.name || 'Unknown',
            duration: this.duration,
            frameRate: this.frameRate,
            totalFrames: this.getTotalFrames(),
            width: this.videoElement.videoWidth,
            height: this.videoElement.videoHeight,
            currentTime: this.videoElement.currentTime,
            currentFrame: this.getCurrentFrameNumber()
        };
    }

    cleanup() {
        if (this.currentVideo && this.currentVideo.url) {
            URL.revokeObjectURL(this.currentVideo.url);
        }
        this.currentVideo = null;
        this.duration = 0;
        this.isPlaying = false;
    }
}