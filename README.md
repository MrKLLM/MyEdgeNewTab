# MYEDGENEWTAB

A customizable Microsoft Edge new tab page with background carousel & Bing search (optimized for no white screen during image switching).

**Switch to Chinese Version:** [README_cn.md](README_cn.md)

## KEY DIFFERENCES BETWEEN VERSIONS

- **v1.1.x (Current)**: Uses a batch file to auto-generate `image-list.json` — no manual editing required.

- **v1.0.0 (Legacy)**: Requires manual editing of image filenames in core files.

## FEATURES

- **Auto Image List Generation:** Batch file scans images folder and generates `image-list.json` (supports Chinese/spaced filenames)

- **Enhanced Filename Compatibility:** Supports filenames with spaces and encoded `%20` characters

- **Smooth Background Carousel:** Preload images to eliminate white screen during switching (1s fade-in/out transition)

- **Bing Search Integration:** Full-featured search box (Enter key/button support)

- **Customizable UI:** Adjust carousel interval, search box size/style, fallback background color

- **Error Handling:** Clear alerts for missing images/JSON files, fallback styles for broken image loads

## SUPPORTED ENVIRONMENTS

- Microsoft Edge (Chromium-based) - [Download](https://www.microsoft.com/edge)

- Windows OS (batch file only works on Windows)

- Node.js (required for batch file to run `generate-image-list.js`) - [Download](https://nodejs.org/)

- Git (for cloning/updating local repository) - [Download](https://git-scm.com/downloads)

> **Note:** If you plan to use the automatic image list generation feature or clone the repository via Git, please ensure Node.js and Git are installed in advance.

## INSTALLATION

### OPTION 1: DOWNLOAD FROM RELEASE (RECOMMENDED FOR END USERS)

1. Download the latest release folder from [Releases](https://github.com/YourUsername/MyEdgeNewTab/releases)

2. **Load to Edge:** Open `edge://extensions/` → Enable Developer mode → Click "Load unpacked" → Select the downloaded folder

### OPTION 2: CLONE REPOSITORY TO LOCAL (FOR DEVELOPERS/ADVANCED USERS)

bash

git clone https://github.com/YourUsername/MyEdgeNewTab.git
cd MyEdgeNewTab

Then load the folder to Edge via `edge://extensions/` (Developer mode enabled).

## USAGE

### PREPARE IMAGES

Place your images (PNG/JPG/JPEG/WEBP only) into the `images` subfolder.

### AUTO-GENERATE IMAGE LIST

1. Ensure Node.js is installed (run `node --version` to check)

2. Double-click `generate-image-list.bat` (Windows only)

3. The script will generate/overwrite `image-list.json` with all valid image filenames

### USE THE CUSTOM NEW TAB

- New Edge tabs will carousel through your images automatically

- Use the search box: Type a query → Press Enter or click the Search button to run Bing search

## CUSTOMIZATION

### ADJUST CAROUSEL INTERVAL

Edit `script.js` and modify:

javascript

const slideInterval = 4000; // Change to desired milliseconds

### CUSTOMIZE SEARCH BOX

Edit `styles.css` to tweak the search box/button style:

css

#search-input {
  width: 600px;
  border-radius: 30px;
}

#search-button {
  background-color: #28a745;
  font-size: 15px;
}

## IMPORTANT NOTES

- **Update Images:** When adding/removing/replacing images in `images` folder → Re-run `generate-image-list.bat`

- **Image Formats:** Only PNG/JPG/JPEG/WEBP are supported

- **Batch File Requirement:** Node.js must be installed

- **First Load:** Images are cached on first load — subsequent switches are instant

- **Git Sync Notes:** If you modified local files, back them up before running `git pull`

## TROUBLESHOOTING

| Issue                                       | Solution                                                                                        |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| "Scan images failed" alert                  | Re-run `generate-image-list.bat` to generate `image-list.json`                                  |
| "No images in images folder" alert          | Add valid images to `images` → Re-run the batch file                                            |
| Batch file does nothing when double-clicked | Check if Node.js is installed, run `node --version` in Command Prompt to confirm                |
| White screen during carousel                | Check for broken image paths/filenames; ensure images are valid (preload is enabled by default) |
| Search box not working                      | Verify `script.js` is intact (do not modify search-input/search-button IDs) → Refresh the tab   |

## CHANGELOG

### V1.1.1

- Enhanced filename compatibility: supports filenames with spaces and encoded `%20` characters

- Added `getCorrectImagePath` function for unified path handling

- Maintained all core features from v1.1.0

- Added comprehensive code comments for easier maintenance

### V1.1.0

- Added `generate-image-list.bat`/`generate-image-list.js` to auto-generate `image-list.json`

- Implemented image preloading to eliminate white screen during carousel

- Added fallback background color (#f5f5f5)

- Improved error handling with clear alert messages

- Optimized carousel transition logic (1s fade-in/out)

### V1.0.0

- Basic background carousel and Bing search functionality

- Required manual editing of image filenames into core files
