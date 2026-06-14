# MYEDGENEWTAB

A customizable Microsoft Edge new tab page with background carousel & Bing search (optimized for no white screen during image switching).

**Switch to Chinese Version:** [README_cn.md](README_cn.md)

## KEY DIFFERENCES BETWEEN VERSIONS

- **v1.2.3 (Current)**: Major polish of the settings panel — unified design tokens, refreshed visual hierarchy, spring-feel animations on buttons & sliders, and bug fixes for the section chevron rotation and the "Restore Defaults" slider sync.

- **v1.2.2 (Legacy)**: Added a search box text color picker in the Search Box Appearance settings section.

- **v1.2.1 (Legacy)**: Minor bug fixes and stability improvements over v1.2.0.

- **v1.2.0 (Legacy)**: Added a full settings panel — import local images directly into the extension (stored via IndexedDB), persistent appearance & carousel configuration, collapsible settings sections, and optimized carousel resource usage.

- **v1.1.x (Legacy)**: Uses a batch file to auto-generate `image-list.json` — no manual editing required.

- **v1.0.0 (Legacy)**: Requires manual editing of image filenames in core files.

## FEATURES

- **Local Image Import:** Select and import images directly from your device via the settings panel. Images are stored in IndexedDB inside the extension — no need to manage files manually.

- **Dual Image Source:** Switch between "My Imported Images" and the "Built-in Image Library" (packaged `images/` folder) at any time from the settings panel.

- **Settings Panel:** A slide-out drawer with persistent configuration across sessions, including collapsible sections for Search Box Appearance, Search Button Appearance, and Carousel settings.

- **Search Box Customization:** Adjust position (distance from top), width, height, border radius, background opacity, and **text color** via sliders and a color picker.

- **Search Button Customization:** Configure button color, font size, border radius, and padding (vertical & horizontal) via sliders and a color picker.

- **Carousel Customization:** Set interval, transition duration, shuffle order, pause carousel, and pause when page is hidden.

- **Reset to Defaults:** One-click button to restore all settings to their default values (v1.2.3 fixes a small slider-sync edge case).

- **Settings panel experience polish (v1.2.3):** Unified design system tokens, refined palette, spring-feel animations on buttons and sliders, and perfectly synced section chevron rotation.

- **Auto Image List Generation:** Batch file scans the `images/` folder and generates `image-list.json` (supports Chinese/spaced filenames) for the built-in library source.

- **Enhanced Filename Compatibility:** Supports filenames with spaces and encoded `%20` characters.

- **Smooth Background Carousel:** Preloads images to eliminate white screen during switching (configurable fade transition).

- **Bing Search Integration:** Full-featured search box (Enter key / button support).

- **Error Handling:** Clear alerts for missing images/JSON files, fallback styles for broken image loads.

## SUPPORTED ENVIRONMENTS

- Microsoft Edge (Chromium-based) - [Download](https://www.microsoft.com/edge)

- Windows OS (batch file only works on Windows)

- Node.js (required for batch file to run `generate-image-list.js`) - [Download](https://nodejs.org/)

- Git (for cloning/updating local repository) - [Download](https://git-scm.com/downloads)

> **Note:** Node.js and Git are only needed if you plan to use the automatic image list generation feature or clone the repository via Git. For most users, the settings panel's import feature is sufficient.

## INSTALLATION

### OPTION 1: DOWNLOAD FROM RELEASE (RECOMMENDED FOR END USERS)

1. Download the latest release folder from [Releases](https://github.com/YourUsername/MyEdgeNewTab/releases)

2. **Load to Edge:** Open `edge://extensions/` → Enable Developer mode → Click "Load unpacked" → Select the downloaded folder

### OPTION 2: CLONE REPOSITORY TO LOCAL (FOR DEVELOPERS/ADVANCED USERS)

```bash
git clone https://github.com/YourUsername/MyEdgeNewTab.git
cd MyEdgeNewTab
```

Then load the folder to Edge via `edge://extensions/` (Developer mode enabled).

## USAGE

### IMPORT YOUR OWN IMAGES (RECOMMENDED)

1. Open a new tab → Click the **⚙** button (top-right corner) to open the settings panel

2. Under **Background Images**, ensure "My Imported Images" is selected

3. Click **+ Select Local Images** to pick one or more image files from your device

4. Images are saved inside the extension (IndexedDB) and will persist across sessions

5. To remove individual images, hover over a thumbnail in the preview grid and click **×**; to remove all, click **Clear**

### USE THE BUILT-IN IMAGE LIBRARY

1. Place your images (PNG/JPG/JPEG/WEBP only) into the `images/` subfolder

2. Ensure Node.js is installed (run `node --version` to check)

3. Double-click `generate-image-list.bat` (Windows only) to generate `image-list.json`

4. Open the settings panel → Select "Built-in Image Library" under Background Images

### USE THE CUSTOM NEW TAB

- New Edge tabs will carousel through your images automatically

- Use the search box: Type a query → Press Enter or click the Search button to run Bing search

- Click **⚙** to open the settings panel and adjust appearance, carousel behavior, and image source at any time

## CUSTOMIZATION

All visual and behavioral settings are available in the settings panel (⚙ button). Changes are saved automatically and persist across sessions. You can also reset everything to defaults with the **🔄 Restore Default Configuration** button.

For advanced users who prefer direct code edits:

### ADJUST CAROUSEL INTERVAL

Edit `script.js` and modify the `DEFAULT_SETTINGS` object:

```javascript
carouselIntervalSec: 4, // Change to desired seconds
```

### CUSTOMIZE SEARCH BOX

Edit `styles.css` to override CSS variables:

```css
:root {
  --search-width: 600px;
  --search-radius: 30px;
  --search-text-color: #000000;
}
```

## IMPORTANT NOTES

- **Imported images** are stored in IndexedDB — they persist within the browser profile and do not require re-importing after reloading the extension, unless the extension is removed or browser data is cleared.

- **Built-in library:** When adding/removing/replacing images in the `images/` folder, re-run `generate-image-list.bat` to update `image-list.json`.

- **Image Formats:** Only PNG/JPG/JPEG/WEBP are supported.

- **First Load:** Images are cached on first load — subsequent carousel switches are instant.

- **Git Sync Notes:** If you modified local files, back them up before running `git pull`.

## TROUBLESHOOTING

| Issue                                             | Solution                                                                                        |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| "Scan images failed" alert                        | Re-run `generate-image-list.bat` to generate `image-list.json`                                  |
| "No images in images folder" alert                | Add valid images to `images/` → Re-run the batch file                                           |
| Batch file does nothing when double-clicked       | Check if Node.js is installed; run `node --version` in Command Prompt to confirm                |
| White screen during carousel                      | Check for broken image paths/filenames; ensure images are valid (preload is enabled by default) |
| Search box not working                            | Verify `script.js` is intact (do not modify search-input/search-button IDs) → Refresh the tab   |
| Imported images lost after reinstalling extension | This is expected — IndexedDB is tied to the extension install; re-import your images            |
| Built-in library empty in settings panel          | Run `generate-image-list.bat` first, then reload the extension                                  |
| Search text color not applying                    | Ensure you are on v1.2.2 or later; try clicking "Restore Default Configuration" and reconfiguring |
| Sliders stuck at old position after Reset          | Please upgrade to v1.2.3 or later                                                       |

## CHANGELOG

### V1.2.3

- **Settings panel visual & layout overhaul**: `styles.css` introduces a full design-system token set (spacing, radius, font sizes, text colors, primary/danger tri-state palette, shadows, easings, durations) to unify the look across all controls.
- **Buttons interaction upgrade** (6 core buttons):
  - Close ✕: hover rotates 90° + scales up; active uses a spring curve down to 0.88
  - Primary blue buttons (Import, Reset): hover lifts 3px with a blue glow shadow; active uses spring press-down
  - Danger button (Clear): hover lifts with a red glow shadow; active uses spring press-down
  - Section toggle ▶: hover scales to 1.18; active spring-shrinks to 0.85
  - Color picker: hover lifts and scales; active spring press-down
- **Slider track & thumb rewritten** (with both webkit and Firefox prefixes):
  - Track 6px → spring-grows to 8px on hover
  - Thumb 16px circle: hover scales to 1.25 with a stronger shadow; active shows a blue halo ring and a grab/grabbing cursor
  - Gradient fills the already-traversed portion via the new `--range-progress` CSS variable
- **New spring curve tokens**: `--ease-spring` (release), `--ease-bounce` (press-down)
- **Fixed section toggle "rotates every other time" bug**: a flipped boolean in `classList.toggle('expanded', !isHidden)` made the chevron rotate on collapse but not on expand
- **Fixed "Restore Defaults" slider sync bug**: assigning `input.value` from JS does not fire the `input` event, so `--range-progress` used to stay on the old percentage — `syncUi` now resyncs the progress variable for every range
- **Accessibility**: `prefers-reduced-motion: reduce` now also disables all new spring animations and transforms

### V1.2.2

- Added search box text color picker in the Search Box Appearance settings section
- Added `--search-text-color` CSS variable and `searchTextColorHex` setting with hex validation
- Placeholder text color remains subtly dimmed independently of the main text color setting

### V1.2.1

- Minor bug fixes and stability improvements

### V1.2.0

- Added settings panel (⚙ slide-out drawer) with persistent configuration via `chrome.storage.local` (falls back to `localStorage`)

- Added local image import: select images from your device, stored in IndexedDB inside the extension

- Added dual image source selector: switch between "My Imported Images" and "Built-in Image Library"

- Added preview grid with per-image delete and full clear functionality

- Added Search Box Appearance settings: position, width, height, border radius, opacity (all via sliders)

- Added Search Button Appearance settings: color picker, font size, border radius, vertical/horizontal padding

- Added Carousel settings: interval, transition duration, shuffle, pause toggle, pause-when-hidden toggle

- Added "Restore Default Configuration" button

- Added collapsible sections for Search Box, Search Button, and Carousel settings

- Optimized carousel resource usage (pause on hidden tab, configurable transition)

- Fixed search opacity CSS variable to use 0–1 decimal instead of incorrect `calc()` computation

### V1.1.1

- Enhanced filename compatibility: supports filenames with spaces and encoded `%20` characters

- Added `getCorrectImagePath` function for unified path handling

- Maintained all core features from v1.1.0

- Added comprehensive code comments for easier maintenance

### V1.1.0

- Added `generate-image-list.bat`/`generate-image-list.js` to auto-generate `image-list.json`

- Implemented image preloading to eliminate white screen during carousel

- Added fallback background color (#f5f5f5)

- Improved error handling with clear alert messages

- Optimized carousel transition logic (1s fade-in/out)

### V1.0.0

- Basic background carousel and Bing search functionality

- Required manual editing of image filenames into core files
