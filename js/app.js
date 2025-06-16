// Main application controller
class FrameExtractorApp {
    constructor() {
        this.videoHandler = new VideoHandler();
        this.frameExtractor = new FrameExtractor();
        this.downloadManager = new DownloadManager();
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.currentTab = 'extract';
        this.initializeApp();
    }

    initializeApp() {
        // Get DOM elements
        this.elements = {
            uploadArea: document.getElementById('uploadArea'),
            uploadSection: document.getElementById('uploadSection'),
            workspace: document.getElementById('workspace'),
            fileInput: document.getElementById('fileInput'),
            videoPlayer: document.getElementById('videoPlayer'),
            playPauseBtn: document.getElementById('playPauseBtn'),
            overlayPlayBtn: document.getElementById('overlayPlayBtn'),
            timeline: document.getElementById('timeline'),
            prevFrameBtn: document.getElementById('prevFrameBtn'),
            nextFrameBtn: document.getElementById('nextFrameBtn'),
            extractFrameBtn: document.getElementById('extractFrameBtn'),
            addToCollectionBtn: document.getElementById('addToCollectionBtn'),
            clearCollectionBtn: document.getElementById('clearCollectionBtn'),
            downloadAllBtn: document.getElementById('downloadAllBtn'),
            frameCanvas: document.getElementById('frameCanvas'),
            themeToggle: document.getElementById('themeToggle'),
            collectionBadge: document.getElementById('collectionBadge'),
            notificationContainer: document.getElementById('notificationContainer')
        };

        // Initialize theme
        this.applyTheme(this.currentTheme);

        // Initialize components
        this.videoHandler.init(this.elements.videoPlayer);
        this.frameExtractor.init(this.elements.frameCanvas);

        // Setup event listeners
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.setupTabSwitching();
        this.setupThemeToggle();
        this.setupAnimations();
    }

    setupEventListeners() {
        // Upload area events
        this.elements.uploadArea.addEventListener('click', () => {
            this.elements.fileInput.click();
        });

        this.elements.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.elements.uploadArea.classList.add('drag-over');
        });

        this.elements.uploadArea.addEventListener('dragleave', () => {
            this.elements.uploadArea.classList.remove('drag-over');
        });

        this.elements.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.elements.uploadArea.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });

        this.elements.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // Video control events
        this.elements.playPauseBtn.addEventListener('click', () => {
            this.videoHandler.togglePlayPause();
        });

        this.elements.overlayPlayBtn.addEventListener('click', () => {
            this.videoHandler.togglePlayPause();
        });

        this.elements.timeline.addEventListener('input', (e) => {
            this.videoHandler.seekToPercent(parseFloat(e.target.value));
        });

        this.elements.prevFrameBtn.addEventListener('click', () => {
            this.videoHandler.previousFrame();
            this.updateFramePreview();
        });

        this.elements.nextFrameBtn.addEventListener('click', () => {
            this.videoHandler.nextFrame();
            this.updateFramePreview();
        });

        // Frame extraction events
        this.elements.extractFrameBtn.addEventListener('click', () => {
            this.extractCurrentFrame();
        });

        this.elements.addToCollectionBtn.addEventListener('click', () => {
            this.addFrameToCollection();
        });

        // Collection events
        this.elements.clearCollectionBtn.addEventListener('click', () => {
            this.downloadManager.clearCollection();
        });

        this.elements.downloadAllBtn.addEventListener('click', () => {
            this.downloadManager.downloadCollection();
        });

        // Video events for frame preview update
        this.elements.videoPlayer.addEventListener('timeupdate', () => {
            if (!this.elements.videoPlayer.seeking) {
                this.updateFramePreview();
            }
        });

        this.elements.videoPlayer.addEventListener('seeked', () => {
            this.updateFramePreview();
        });

        this.elements.videoPlayer.addEventListener('loadeddata', () => {
            this.updateFramePreview();
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    this.videoHandler.togglePlayPause();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (e.shiftKey) {
                        // Seek backward 5 seconds
                        this.videoHandler.seekByFrames(-150); // ~5 seconds at 30fps
                    } else {
                        this.videoHandler.previousFrame();
                    }
                    this.updateFramePreview();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (e.shiftKey) {
                        // Seek forward 5 seconds
                        this.videoHandler.seekByFrames(150); // ~5 seconds at 30fps
                    } else {
                        this.videoHandler.nextFrame();
                    }
                    this.updateFramePreview();
                    break;
                case 'e':
                case 'E':
                    e.preventDefault();
                    this.extractCurrentFrame();
                    break;
                case 'a':
                case 'A':
                    e.preventDefault();
                    this.addFrameToCollection();
                    break;
                case 'd':
                case 'D':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.downloadManager.downloadCollection();
                    }
                    break;
            }
        });
    }

    async handleFileSelect(file) {
        const success = await this.videoHandler.handleFileUpload(file);
        
        if (success) {
            // Minimize upload section with animation
            this.elements.uploadSection.classList.add('minimized');
            this.elements.uploadArea.classList.add('minimized');
            
            // Show workspace with animation
            this.elements.workspace.style.display = 'grid';
            
            // Trigger fade-in animation
            requestAnimationFrame(() => {
                this.elements.workspace.style.opacity = '1';
            });
            
            // Update UI
            this.updateVideoInfo();
            
            // Enable controls
            this.enableControls();
            
            // Update frame preview
            setTimeout(() => {
                this.updateFramePreview();
            }, 500);
        }
    }

    updateVideoInfo() {
        const info = this.videoHandler.getVideoInfo();
        
        // You could display this info in the UI if desired
        console.log('Video loaded:', info);
    }

    updateFramePreview() {
        if (this.elements.videoPlayer.readyState >= 2) {
            this.frameExtractor.updateFramePreview(this.elements.videoPlayer);
        }
    }

    async extractCurrentFrame() {
        await this.frameExtractor.downloadFrame(this.elements.videoPlayer);
    }

    async addFrameToCollection() {
        const frameData = await this.frameExtractor.captureFrameAsBlob(this.elements.videoPlayer);
        if (frameData) {
            this.downloadManager.addToCollection(frameData);
        }
    }

    enableControls() {
        this.elements.playPauseBtn.disabled = false;
        this.elements.timeline.disabled = false;
        this.elements.prevFrameBtn.disabled = false;
        this.elements.nextFrameBtn.disabled = false;
        this.elements.extractFrameBtn.disabled = false;
        this.elements.addToCollectionBtn.disabled = false;
    }

    // Theme management
    setupThemeToggle() {
        this.elements.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        const sunIcon = this.elements.themeToggle.querySelector('.sun-icon');
        const moonIcon = this.elements.themeToggle.querySelector('.moon-icon');
        
        if (theme === 'dark') {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    }

    // Tab switching functionality
    setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
        
        this.currentTab = tabName;
    }

    // Animation setup
    setupAnimations() {
        // Add stagger animation to elements as they appear
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationDelay = '0s';
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.glass-panel, .action-btn').forEach(el => {
            observer.observe(el);
        });
    }

    // Enhanced notification system
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Add icon based on type
        let icon = '';
        switch(type) {
            case 'success':
                icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>';
                break;
            case 'error':
                icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
                break;
            default:
                icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
        }
        
        notification.innerHTML = `${icon}<span>${message}</span>`;
        
        this.elements.notificationContainer.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // Update collection badge
    updateCollectionBadge(count) {
        this.elements.collectionBadge.textContent = count;
        
        // Animate badge on update
        this.elements.collectionBadge.style.transform = 'scale(1.2)';
        setTimeout(() => {
            this.elements.collectionBadge.style.transform = 'scale(1)';
        }, 150);
    }

    // Enhanced frame preview with loading state
    updateFramePreview() {
        if (this.elements.videoPlayer.readyState >= 2) {
            const previewImg = document.getElementById('framePreview');
            const loadingElement = document.querySelector('.preview-loading');
            
            // Show loading state
            loadingElement.style.opacity = '1';
            
            // Update preview
            this.frameExtractor.updateFramePreview(this.elements.videoPlayer);
            
            // Hide loading state when image loads
            previewImg.onload = () => {
                loadingElement.style.opacity = '0';
            };
        }
    }

    // Enhanced extraction with feedback
    async extractCurrentFrame() {
        try {
            // Add loading state to button
            const btn = this.elements.extractFrameBtn;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<div class="pulse-loader" style="width: 20px; height: 20px;"></div>Extracting...';
            btn.disabled = true;
            
            await this.frameExtractor.downloadFrame(this.elements.videoPlayer);
            
            // Show success feedback
            this.showNotification('Frame downloaded successfully!', 'success');
            
            // Reset button
            btn.innerHTML = originalText;
            btn.disabled = false;
        } catch (error) {
            this.showNotification('Failed to extract frame', 'error');
            
            // Reset button
            const btn = this.elements.extractFrameBtn;
            btn.innerHTML = btn.getAttribute('data-original-text') || 'Download Frame';
            btn.disabled = false;
        }
    }

    // Enhanced collection adding with feedback
    async addFrameToCollection() {
        try {
            const frameData = await this.frameExtractor.captureFrameAsBlob(this.elements.videoPlayer);
            if (frameData) {
                const success = this.downloadManager.addToCollection(frameData);
                if (success) {
                    this.updateCollectionBadge(this.downloadManager.frameCollection.length);
                    this.showNotification('Frame added to collection!', 'success');
                    
                    // Switch to collection tab if this is the first frame
                    if (this.downloadManager.frameCollection.length === 1) {
                        setTimeout(() => {
                            this.switchTab('collection');
                        }, 1000);
                    }
                }
            }
        } catch (error) {
            this.showNotification('Failed to add frame to collection', 'error');
        }
    }

    // Public methods for external access
    getVideoInfo() {
        return this.videoHandler.getVideoInfo();
    }

    exportCollectionInfo() {
        this.downloadManager.exportCollectionInfo();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.frameExtractorApp = new FrameExtractorApp();
    
    // Add keyboard shortcuts help tooltip
    const shortcutsHelp = `
Keyboard Shortcuts:
• Space: Play/Pause
• ← →: Previous/Next frame
• Shift + ← →: Skip 5 seconds
• E: Extract current frame
• A: Add to collection
• Ctrl/Cmd + D: Download collection
    `.trim();
    
    // Log shortcuts to console for users
    console.log('%c' + shortcutsHelp, 'color: #2563eb; font-size: 12px;');
});