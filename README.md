# MYEDGENEWTAB V1.1.0

A customizable Microsoft Edge new tab page with background carousel & Bing search (optimized for no white screen during image switching).

**Switch to Chinese Version:** [README_cn.md](README_cn.md)

## KEY DIFFERENCES FROM V1.0.0

The core difference is **NO MANUAL EDITING OF IMAGE FILENAMES** — v1.1.0 uses a batch file to auto-generate the image list JSON file, while v1.0.0 requires manual input of image names into core files.

## FEATURES

- **Auto Image List Generation:** Batch file scans images folder and generates `image-list.json` (supports Chinese/spaced filenames)
- **Smooth Background Carousel:** Preload images to eliminate white screen during switching (1s fade-in/out transition)
- **Bing Search Integration:** Full-featured search box (Enter key/button support)
- **Customizable UI:** Adjust carousel interval, search box size/style, fallback background color
- **Error Handling:** Clear alerts for missing images/JSON files, fallback styles for broken image loads

## SUPPORTED ENVIRONMENTS

- Microsoft Edge (Chromium-based) - [Download](https://www.microsoft.com/edge)
- Windows OS (batch file only works on Windows)
- Node.js (required for batch file to run `generate-image-list.js`) - [Download](https://nodejs.org/)
- Git (for cloning/updating local repository) - [Download](https://git-scm.com/downloads)

> **Note:** If you plan to use the automatic image list generation feature or clone the repository via Git, please ensure Node.js and Git are installed in advance.

## INSTALLATION

### OPTION 1: DOWNLOAD FROM RELEASE (RECOMMENDED FOR END USERS)

1. **For v1.1.0:** Download the `MyEdgeNewTab 1.1.0` folder from [Release v1.1.0](https://github.com/YourUsername/MyEdgeNewTab/releases/tag/v1.1.0)
2. **For v1.0.0:** Download the `MyEdgeNewTab 1.0.0` folder from [Release v1.0.0](https://github.com/YourUsername/MyEdgeNewTab/releases/tag/v1.0.0)
3. **Load to Edge:** Open `edge://extensions/` → Enable Developer mode → Click "Load unpacked" → Select the downloaded folder

### OPTION 2: CLONE REPOSITORY TO LOCAL (FOR DEVELOPERS/ADVANCED USERS)

This method allows you to keep your local files in sync with the latest GitHub repository updates.

#### STEP 1: CLONE THE GITHUB REPOSITORY TO LOCAL

1. **Install Git:** Download and install Git from [https://git-scm.com/downloads](https://git-scm.com/downloads)
2. **Install Node.js:** Download and install Node.js from [https://nodejs.org/](https://nodejs.org/) (recommend LTS version)
3. Open Command Prompt/Terminal and navigate to the folder where you want to store the project:

```bash
cd /path/to/your/target/folder
# Example: cd C:\Users\YourName\Projects
```

4. Clone the repository (replace with your GitHub repo URL):

```bash
git clone https://github.com/YourUsername/MyEdgeNewTab.git
```

5. Enter the cloned folder:

```bash
cd MyEdgeNewTab
```

#### STEP 2: LINK LOCAL REPOSITORY TO GITHUB (IF YOU CLONED MANUALLY)

If you already have a local folder and want to link it to the GitHub repository (instead of cloning):

1. Initialize local Git repository (skip if already initialized):

```bash
git init
```

2. Link to remote GitHub repository:

```bash
git remote add origin https://github.com/YourUsername/MyEdgeNewTab.git
```

3. Pull the latest code from GitHub (to sync local with remote):

```bash
git pull origin main
```

#### STEP 3: UPDATE LOCAL REPOSITORY WHEN GITHUB IS UPDATED

When the GitHub repository has new updates (e.g., v1.2.0 release, bug fixes), sync your local files:

1. Ensure you are in the project root folder:

```bash
cd /path/to/MyEdgeNewTab
```

2. Pull the latest changes from the main branch:

```bash
git pull origin main
```

3. (Optional) Switch to a specific version tag (e.g., v1.1.0):

```bash
git checkout v1.1.0
```

4. To switch back to the latest main branch:

```bash
git checkout main
```

#### STEP 4: LOAD TO EDGE

1. Open Edge and navigate to `edge://extensions/`
2. Enable Developer mode (toggle in the top-right corner)
3. Click **Load unpacked** and select the cloned `MyEdgeNewTab` folder (or the `v1.1.0`/`v1.0.0` subfolder)
4. Open a new tab — the custom page will load automatically

## USAGE (V1.1.0 CORE FLOW)

### PREPARE IMAGES

Place your images (PNG/JPG/JPEG/WEBP only) into the `images` subfolder of `MyEdgeNewTab 1.1.0`.

### AUTO-GENERATE IMAGE LIST (CRITICAL)

This step replaces manual filename editing (v1.0.0 workflow):

1. **Ensure Node.js is installed:** Type `node --version` in Command Prompt to verify installation

2. Double-click `generate-image-list.bat` (Windows only)

3. A CMD window will pop up with:
   
   ```
   ==============================
   Generating image list...
   ==============================
   Done! Press any key to close.
   ==============================
   ```

4. The batch file runs `generate-image-list.js` to create/overwrite `image-list.json` (root folder) with all valid image filenames

5. **If skipped:** Alert shows "Scan images failed, please double-click generate-image-list.bat first!"

### USE THE CUSTOM NEW TAB

- New Edge tabs will carousel through your images automatically
- Use the search box: Type a query → Press Enter or click the Search button to run Bing search

## CUSTOMIZATION

### ADJUST CAROUSEL INTERVAL

1. Open `script.js` with a text editor (VS Code/Notepad++)

2. Locate:
   
   ```javascript
   const slideInterval = 4000; // 4000ms = 4s (default)
   ```

3. Modify the value (e.g., 5000 for 5s, 10000 for 10s) → Save → Refresh the new tab (Ctrl+R)

### CUSTOMIZE SEARCH BOX

Edit `styles.css` to tweak the search box/button style:

**SEARCH BOX PROPERTIES**
| Property | Default | Description |
|----------|---------|-------------|
| width | 550px | Adjust width |
| height | 23px | Adjust height |
| font-size | 16px | Text size |
| border-radius | 24px | Rounded corner radius |

**SEARCH BUTTON PROPERTIES**
| Property | Default | Description |
|----------|---------|-------------|
| background-color | #4285f4 | Button color |
| font-size | 14px | Text size |
| border-radius | 4px | Rounded corner radius |

**EXAMPLE CUSTOMIZATION:**

```css
/* Modify search box in styles.css */
#search-input {
  width: 600px;  /* Wider */
  height: 25px;
  border-radius: 30px;  /* More rounded */
}

/* Modify search button */
#search-button {
  background-color: #28a745;  /* Green */
  font-size: 15px;
}
```

## IMPORTANT NOTES

- **Update Images:** When adding/removing/replacing images in `images` folder → Re-run `generate-image-list.bat` to overwrite `image-list.json` (old list won't update automatically)
- **Image Formats:** Only PNG/JPG/JPEG/WEBP are supported (filtered by the batch script)
- **Batch File Requirement:** Node.js must be installed (to run `generate-image-list.js`)
- **First Load:** Images are cached on first load — subsequent switches are instant
- **Git Sync Notes:** If you modified local files (e.g., custom styles), run `git pull origin main` will overwrite your changes. Back up modified files before syncing

## TROUBLESHOOTING

| Issue                                       | Solution                                                                                        |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| "Scan images failed" alert                  | Re-run `generate-image-list.bat` to generate `image-list.json`                                  |
| "No images in images folder" alert          | Add valid images to `images` → Re-run the batch file                                            |
| Batch file does nothing when double-clicked | Check if Node.js is installed, run `node --version` in Command Prompt to confirm                |
| White screen during carousel                | Check for broken image paths/filenames; ensure images are valid (preload is enabled by default) |
| Search box not working                      | Verify `script.js` is intact (do not modify search-input/search-button IDs) → Refresh the tab   |
| Custom styles not applied                   | Refresh the tab (Ctrl+R) or reload the extension in `edge://extensions/`                        |
| Git pull fails                              | Ensure no uncommitted local changes; run `git stash` to save changes temporarily before pulling |

## CHANGELOG

### V1.1.0

- Added `generate-image-list.bat`/`generate-image-list.js` to auto-generate `image-list.json` (no manual filename editing)
- Implemented image preloading to eliminate white screen during carousel
- Added fallback background color (#f5f5f5) for empty image areas
- Improved error handling with clear alert messages
- Optimized carousel transition logic (1s fade-in/out)

### V1.0.0

- Basic background carousel and Bing search functionality
- Required manual editing of image filenames into core files
