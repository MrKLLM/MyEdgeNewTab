# MYEDGENEWTAB

A customizable Microsoft Edge new tab page with background carousel & Bing search (optimized for no white screen during image switching).

**Switch to Chinese Version:** [README_cn.md](README_cn.md)

## KEY DIFFERENCES BETWEEN VERSIONS

- **v1.4.1 (Current)**: Fixed the "Search Box & Button Spacing (px)" setting — previously adjusting the spacing also moved the search box itself because the search container was vertically centered; it now changes only the gap between the search box and the button, leaving the search box position untouched. Current parameters locked in as defaults.
- **v1.4.0 (Legacy)**: Added exporting imported images to a local folder (export all or export selected).
- **v1.3.0 (Legacy)**: Added a third "Local Folder" image source that reads images directly without importing; imported-image thumbnails are now collapsed in settings and shown in a centered floating preview window; multi-select delete for imported images; paged/performance-optimized preview loading; removed the built-in image library feature.

- **v1.2.3 (Legacy)**: Major polish of the settings panel — unified design tokens, refreshed visual hierarchy, spring-feel animations on buttons & sliders, and bug fixes for the section chevron rotation and the "Restore Defaults" slider sync.

- **v1.2.2 (Legacy)**: Added a search box text color picker in the Search Box Appearance settings section.

- **v1.2.1 (Legacy)**: Minor bug fixes and stability improvements over v1.2.0.

- **v1.2.0 (Legacy)**: Added a full settings panel — import local images directly into the extension (stored via IndexedDB), persistent appearance & carousel configuration, collapsible settings sections, and optimized carousel resource usage.

- **v1.1.x (Legacy)**: Uses a batch file to auto-generate `image-list.json` — no manual editing required.

- **v1.0.0 (Legacy)**: Requires manual editing of image filenames in core files.

## FEATURES

- **Local Image Import:** Select and import images directly from your device via the settings panel. Images are stored in IndexedDB inside the extension — no need to manage files manually.

- **Local Folder Source:** Pick a local folder directly and carousel through its images without importing/copying them into IndexedDB — no need to run the image-list generation script.


- **Multi-select Image Management:** Imported image previews include checkboxes, so you can select multiple images and delete them together, or select all at once.

- **Floating Preview Window:** Imported image thumbnails are collapsed in the settings by default; click “View Imported Images” to open a centered floating window for browsing and managing them.


- **Performance with Many Images:** The preview window loads thumbnails in batches (40 per page) to avoid rendering all images at once and causing lag.



- **Dual Image Source:** Switch between "My Imported Images" and "Local Folder" (direct folder reading) at any time from the settings panel.

- **Settings Panel:** A slide-out drawer with persistent configuration across sessions, including collapsible sections for Search Box Appearance, Search Button Appearance, and Carousel settings.

- **Search Box Customization:** Adjust position (distance from top), width, height, border radius, background opacity, and **text color** via sliders and a color picker.

- **Search Button Customization:** Configure button color, font size, border radius, and padding (vertical & horizontal) via sliders and a color picker.

- **Carousel Customization:** Set interval, transition duration, shuffle order, pause carousel, and pause when page is hidden.

- **Reset to Defaults:** One-click button to restore all settings to their default values (v1.2.3 fixes a small slider-sync edge case).

- **Settings panel experience polish (v1.2.3):** Unified design system tokens, refined palette, spring-feel animations on buttons and sliders, and perfectly synced section chevron rotation.

- **Enhanced Filename Compatibility:** Supports filenames with spaces and encoded `%20` characters.

- **Smooth Background Carousel:** Preloads images to eliminate white screen during switching (configurable fade transition).

- **Bing Search Integration:** Full-featured search box (Enter key / button support).

- **Error Handling:** Clear alerts for missing images/JSON files, fallback styles for broken image loads.
- **Simplified Carousel Switches:** Checkbox options no longer show redundant "On/Off" labels.

## SUPPORTED ENVIRONMENTS

- Microsoft Edge (Chromium-based) - [Download](https://www.microsoft.com/edge)

- Git (for cloning/updating local repository) - [Download](https://git-scm.com/downloads)

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

   - You can also click **📁 Select Local Folder** to pick a folder and import all images inside it at once.


4. Images are saved inside the extension (IndexedDB) and will persist across sessions

5. To remove individual images, hover over a thumbnail in the preview grid and click **×**; to remove all, click **Clear**
   - You can also tick multiple image checkboxes and click **Delete Selected** to remove them in batch, or use **Select All**.
6. To view all imported images in a floating window, click **🖼 View Imported Images** — the thumbnails stay out of the settings drawer to keep it compact.



### USE A LOCAL FOLDER AS SOURCE (NO IMPORT)

1. Open the settings panel → Under **Background Images**, select **Local Folder**

2. Click **📁 Select Local Folder** and choose a folder containing images

3. The extension will read images from that folder directly for the carousel, without copying them into IndexedDB

4. You can click **🖼 View Folder Images** to preview the folder contents in the floating window



### USE THE CUSTOM NEW TAB

- Imported images can be viewed in the floating window by clicking **🖼 View Imported Images** in the settings panel.
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

- **Local folder source:** The “Local Folder” mode reads the folder directly and does not copy images. The “Select Local Folder and Import” button under “My Imported Images” still copies images into IndexedDB if you prefer that workflow.


- **Image Formats:** Import supports common image formats.

- **First Load:** Images are cached on first load — subsequent carousel switches are instant.

- **Git Sync Notes:** If you modified local files, back them up before running `git pull`.

## TROUBLESHOOTING

| Issue                                             | Solution                                                                                        |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| White screen during carousel                      | Check for broken image paths/filenames; ensure images are valid (preload is enabled by default) |
| Search box not working                            | Verify `script.js` is intact (do not modify search-input/search-button IDs) → Refresh the tab   |
| Imported images lost after reinstalling extension | This is expected — IndexedDB is tied to the extension install; re-import your images            |
| Search text color not applying                    | Ensure you are on v1.2.2 or later; try clicking "Restore Default Configuration" and reconfiguring |
| Sliders stuck at old position after Reset          | Please upgrade to v1.2.3 or later                                                       |

## CHANGELOG

### V1.3.0

- **Local Folder source (new)**: Added a third image-source mode. Pick a local folder and the extension will read images directly for the carousel — no importing/copying into IndexedDB and no need to run the image-list generation script.
- **Floating preview window**: Imported images are no longer rendered directly in the settings drawer (which avoided pushing other options far down). A new **🖼 View Imported Images** button opens a centered floating window to browse and manage all imported images.
- **Multi-select delete**: Imported image thumbnails have checkboxes; you can tick multiple images and click **Delete Selected**, or use **Select All**.
- **Performance optimization**: The preview window loads thumbnails in batches (40 per page) with a "Load More" button, and releases object URLs when closing to reduce memory usage when you have many images.
- **Simplified carousel toggles**: Removed the "On/Off" text next to carousel checkboxes.
- **Removed built-in image library**: The built-in `images/` library source and related generation script dependency have been removed from the UI.

### V1.2.4

- **Dark theme overhaul ("Rem maid deep-sea blue")**: The settings panel has been completely redesigned with a dark navy gradient background, replacing the previous white/light theme.
- **Color palette rewrite**: Primary color shifted from Google blue (#4285f4) to sky blue (#8fc9ff); danger color from red (#d93025) to pink (#f9a8c4); text colors now use light blue rgba tones for dark-background readability.
- **Settings button restyled**: Larger (42px), dark glass background with blue glow border, hover rotates 32° with scale + glow shadow, active spring press-down.
- **Drawer glassmorphism upgrade**: Deep navy gradient (`rgba(6,22,50 → 4,14,36 → 5,18,44)`), stronger blur (44px), blue-tinted left border, deeper box-shadow.
- **Header accent bar**: New 2px gradient top line (blue → sky → pink) + gradient-filled uppercase title text (`-webkit-background-clip: text`).
- **Slider redesign**: Blue-gradient progress fill, glowing track shadow, gradient thumb with blue halo ring on active, refined Firefox `range-progress` styling.
- **Button glow effects**: All interactive buttons (Import, Reset, Clear, Close, Color Picker) now feature blue/pink glow shadows on hover with spring press-down transitions.
- **Typography refresh**: Added SF Pro Display to font stack, reduced base font sizes, section titles now uppercase with 2.2px letter-spacing and glowing accent bar.
- **Scrollbar restyled**: Thinner (4px) with blue-gradient thumb matching the dark theme.
- **Hover micro-interactions**: Rows, imported items, and source options now show subtle blue-tinted hover backgrounds.
- **Reduced overlay opacity**: Settings backdrop darkened from 35% to 15% so the tab content stays visible.

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
