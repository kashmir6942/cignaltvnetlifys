# ShakaTV - IPTV Player

A modern, web-based IPTV streaming application with support for DRM-protected content and channel testing capabilities.

## Features

- 🎥 **Video Streaming**: Powered by Shaka Player for robust streaming support
- 📺 **Channel Management**: Organize channels by categories (News, Sports, Movies, Entertainment)
- 🔍 **Search & Filter**: Find channels quickly with real-time search
- ✅ **Channel Testing**: Test all channels to verify their status
- 🔐 **DRM Support**: Support for DRM-protected content with clear keys and Widevine
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Dark/light theme with smooth animations
- ⭐ **Favorites**: Save your favorite channels

## Getting Started

### Prerequisites

- A modern web browser with HTML5 video support
- IPTV channel list in text format (optional)

### Installation

1. Clone this repository or download the files
2. Open `index.html` in your web browser or serve it using a local web server:

\`\`\`bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
\`\`\`

3. Navigate to `http://localhost:8000` in your browser

### Channel File Format

You can drag and drop a text file with your channels in the following format:

\`\`\`
# Channel Name 1
https://example.com/channel1.mpd
keyid1:key1

# Channel Name 2
https://example.com/channel2.mpd
keyid2:key2
\`\`\`

- Lines starting with `#` are treated as channel names
- URLs ending with `.mpd` are treated as stream URLs
- Lines with `:` and length > 20 are treated as DRM keys (keyid:key format)

### Usage

1. **Browse Channels**: Use the sidebar to browse pre-loaded channels
2. **Search**: Use the search box to find specific channels
3. **Filter by Category**: Click category buttons to filter channels
4. **Test Channels**: Click "Test All Channels" to verify which channels are working
5. **Watch**: Click on any channel to start streaming
6. **Favorites**: Click the star icon to add channels to favorites
7. **Theme**: Toggle between dark and light themes

## Channel Status Indicators

- 🟢 **Green**: Channel is working
- 🟡 **Yellow**: Channel not tested yet
- 🔴 **Red**: Channel is offline
- 🔵 **Blue**: Channel is being tested

## Features

### DRM Support
- Clear Key DRM for most channels
- Widevine DRM for premium channels
- Automatic DRM configuration

### Categories
- 🧪 Beta Channels (Converge with Widevine DRM)
- 📰 News
- 🏈 Sports  
- 🎬 Movies
- 📺 Entertainment
- 👶 Kids
- ⭐ Favorites

### Testing
- Individual channel testing
- Bulk testing of all channels
- Real-time status updates
- Progress tracking

## Browser Compatibility

- Chrome 53+
- Firefox 47+
- Safari 12.1+
- Edge 79+

## Dependencies

- [Shaka Player](https://github.com/shaka-project/shaka-player) - For video streaming and DRM support
- [Pako](https://github.com/nodeca/pako) - For compression support

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Disclaimer

This application is for educational purposes only. Users are responsible for ensuring they have the right to access and stream the content they load into the application.
