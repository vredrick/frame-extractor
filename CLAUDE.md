# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Frame Extractor is a client-side web application that allows users to upload video files and extract individual frames as PNG images. The application features:

- Drag-and-drop video upload (MP4, WebM, MOV, AVI up to 100MB)
- Frame-by-frame navigation with precise video controls
- Real-time frame preview with timestamp and resolution info
- Individual frame download or bulk collection as ZIP
- Dark/light theme toggle
- Responsive design with glass morphism UI

## Architecture

The application follows a modular class-based architecture with four main components:

### Core Classes
- **FrameExtractorApp** (`js/app.js`) - Main application controller, handles UI coordination, theme management, keyboard shortcuts, and user interactions
- **VideoHandler** (`js/video-handler.js`) - Manages video playback, seeking, frame navigation, and file validation
- **FrameExtractor** (`js/frame-extractor.js`) - Handles frame capture using HTML5 Canvas, generates thumbnails, and manages downloads
- **DownloadManager** (`js/download-manager.js`) - Manages frame collections and ZIP file generation using JSZip library

### Key Technologies
- Vanilla JavaScript (ES6+ classes)
- HTML5 Canvas for frame extraction
- JSZip library for creating downloadable ZIP archives
- CSS Grid and Flexbox for responsive layout
- CSS custom properties for theming

### File Structure
```
/
├── index.html          # Main HTML with complete UI structure
├── css/
│   ├── styles.css     # Main styles with CSS custom properties
│   └── responsive.css # Media queries and responsive adjustments
├── js/
│   ├── app.js         # Main application controller
│   ├── video-handler.js    # Video playback and navigation
│   ├── frame-extractor.js  # Frame capture and preview
│   └── download-manager.js # Collection management and ZIP export
├── lib/
│   └── jszip.min.js   # Third-party ZIP library
└── assets/icons/      # Application icons
```

## Development Workflow

### Testing the Application
- Open `index.html` in a modern web browser
- Test with various video formats (MP4, WebM, MOV, AVI)
- Verify frame extraction accuracy across different video resolutions and frame rates
- Test keyboard shortcuts and responsive behavior

### Key Features to Test
- Video upload validation (file type, size limits)
- Frame navigation accuracy (especially with different frame rates)
- Canvas rendering for various video resolutions
- ZIP file generation with multiple frames
- Theme persistence across sessions
- Responsive layout on different screen sizes

### Browser Compatibility
- Requires modern browser with HTML5 video, Canvas 2D, and File API support
- Uses ES6+ features (classes, async/await, arrow functions)
- Relies on native drag-and-drop API

## Technical Notes

### Frame Rate Detection
The application uses basic frame rate detection defaulting to 30fps. The `VideoHandler.detectFrameRate()` method provides simple resolution-based frame rate guessing but could be enhanced with more sophisticated detection.

### Memory Management
- Frame collection limited to 100 frames to prevent memory issues
- Video file size limited to 100MB for performance
- Canvas dimensions dynamically set to match video resolution
- Blob URLs properly cleaned up to prevent memory leaks

### Canvas Operations
All frame extraction uses the HTML5 Canvas 2D context. The canvas dimensions are set to match the video's native resolution for full-quality frame extraction.

### Keyboard Shortcuts
- Space: Play/Pause
- ← →: Previous/Next frame
- Shift + ← →: Skip 5 seconds
- E: Extract current frame
- A: Add to collection
- Ctrl/Cmd + D: Download collection