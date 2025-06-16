# Frame Extractor

A powerful web-based tool for extracting individual frames from video files. Built with vanilla JavaScript and modern web APIs, Frame Extractor provides an intuitive interface for precise frame capture and batch export.

## Features

- 🎬 **Multi-format Support**: Works with MP4, WebM, MOV, and AVI video files
- 🖱️ **Drag & Drop Upload**: Simple drag-and-drop interface for video files (up to 100MB)
- 🎯 **Precise Frame Navigation**: Frame-by-frame stepping with keyboard shortcuts
- 🖼️ **High-Quality Extraction**: Captures frames at original video resolution
- 📦 **Batch Export**: Collect multiple frames and download as ZIP
- 🌓 **Dark/Light Theme**: Toggle between themes with persistent preference
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Client-Side Processing**: All processing happens in your browser - no uploads required

## Demo

Try it live: [Frame Extractor Demo](https://vredrick.github.io/frame-extractor)

## Installation

Frame Extractor is a client-side web application that runs entirely in your browser. No installation or server setup required!

### Option 1: Use GitHub Pages (Recommended)
Simply visit the [live demo](https://vredrick.github.io/frame-extractor) to start using the application.

### Option 2: Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/vredrick/frame-extractor.git
   cd frame-extractor
   ```

2. Open `index.html` in a modern web browser:
   - Double-click the file, or
   - Use a local web server (e.g., `python -m http.server` or Live Server in VS Code)

## Usage

### Basic Workflow

1. **Upload a Video**: Drag and drop a video file onto the upload area or click to browse
2. **Navigate Frames**: Use the video controls or keyboard shortcuts to find desired frames
3. **Extract Frames**: Click "Extract Frame" to capture the current frame
4. **Build Collection**: Add frames to your collection for batch download
5. **Download**: Save individual frames or download your entire collection as a ZIP file

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause video |
| `←` / `→` | Previous/Next frame |
| `Shift + ←` / `Shift + →` | Skip 5 seconds backward/forward |
| `E` | Extract current frame |
| `A` | Add frame to collection |
| `Ctrl/Cmd + D` | Download collection as ZIP |

### Video Controls

- **Play/Pause**: Toggle video playback
- **Frame Navigation**: Step through frames one at a time
- **Timeline Scrubber**: Click or drag to seek to any position
- **Time Display**: Shows current time and total duration

## Technical Details

### Architecture

Frame Extractor uses a modular, class-based architecture:

- **`FrameExtractorApp`**: Main application controller
- **`VideoHandler`**: Manages video playback and navigation
- **`FrameExtractor`**: Handles frame capture using Canvas API
- **`DownloadManager`**: Manages collections and ZIP generation

### Technologies Used

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Video Processing**: HTML5 Video API, Canvas 2D Context
- **File Handling**: File API, Blob API
- **ZIP Creation**: [JSZip](https://stuk.github.io/jszip/) library
- **UI Design**: CSS Grid, Flexbox, Custom Properties

### Browser Compatibility

Frame Extractor requires a modern browser with support for:
- HTML5 Video element
- Canvas 2D Context
- File API
- ES6+ JavaScript features

Tested and working in:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Limitations

- Maximum video file size: 100MB (for performance)
- Maximum frames in collection: 100 (to prevent memory issues)
- Frame rate detection is approximate (defaults to 30fps)
- Some video codecs may not be supported depending on browser

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [JSZip](https://stuk.github.io/jszip/) for ZIP file generation
- Icons from [Feather Icons](https://feathericons.com/)
- Glass morphism design inspiration from modern UI trends

## Support

If you encounter any issues or have questions:
- Open an [issue](https://github.com/vredrick/frame-extractor/issues)
- Check existing issues for solutions
- Ensure your browser meets the compatibility requirements

---

Made with ❤️ by vredrick