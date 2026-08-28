const DEFAULT_SETTINGS = Object.freeze({
  imageSource: 'imported',
  searchTopPercent: 25,
  searchWidthPx: 550,
  searchHeightPx: 23,
  searchRadiusPx: 24,
  searchOpacityPercent: 90,
  searchTextColorHex: '#202124',   // 新增：搜索框文字颜色
  buttonMarginTopPx: 23,
  btnFontSize: 14,
  btnRadiusPx: 4,
  btnPaddingV: 4,
  btnPaddingH: 14,
  btnColorHex: '#4285f4',
  carouselIntervalSec: 4,
  carouselShuffle: false,
  carouselTransitionMs: 1000,
  carouselPaused: false,
  pauseWhenHidden: true,
});

const SETTINGS_KEY = 'myedgenewtab_settings_v1';
const layers = document.querySelectorAll('.background-layer');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

function clampNumber(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function escapeCssUrl(url) {
  return `url("${String(url).replace(/"/g, '\\"')}")`;
}

const storage = {
  async get() {
    try {
      if (globalThis.chrome?.storage?.local) {
        const result = await new Promise(resolve => chrome.storage.local.get([SETTINGS_KEY], resolve));
        return result?.[SETTINGS_KEY] ?? null;
      }
    } catch (e) {}
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },
  async set(value) {
    try {
      if (globalThis.chrome?.storage?.local) {
        await new Promise(resolve => chrome.storage.local.set({ [SETTINGS_KEY]: value }, resolve));
        return;
      }
    } catch (e) {}
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(value));
    } catch (e) {}
  },
};

function normalizeSettings(settings) {
  const s = { ...DEFAULT_SETTINGS, ...(settings || {}) };
  s.imageSource = ['imported', 'folder'].includes(s.imageSource) ? s.imageSource : 'imported';
  s.searchTopPercent = clampNumber(Number(s.searchTopPercent), 0, 100);
  s.searchWidthPx = clampNumber(Number(s.searchWidthPx), 280, 900);
  s.searchHeightPx = clampNumber(Number(s.searchHeightPx), 18, 60);
  s.searchRadiusPx = clampNumber(Number(s.searchRadiusPx), 0, 40);
  s.searchOpacityPercent = clampNumber(Number(s.searchOpacityPercent), 0, 100);
  // 新增：文字颜色合法性校验
  s.searchTextColorHex = typeof s.searchTextColorHex === 'string' && /^#[0-9a-fA-F]{6}$/.test(s.searchTextColorHex)
    ? s.searchTextColorHex : DEFAULT_SETTINGS.searchTextColorHex;
  s.buttonMarginTopPx = clampNumber(Number(s.buttonMarginTopPx), 0, 200);
  s.btnFontSize = clampNumber(Number(s.btnFontSize), 10, 24);
  s.btnRadiusPx = clampNumber(Number(s.btnRadiusPx), 0, 30);
  s.btnPaddingV = clampNumber(Number(s.btnPaddingV), 0, 30);
  s.btnPaddingH = clampNumber(Number(s.btnPaddingH), 4, 60);
  s.btnColorHex = typeof s.btnColorHex === 'string' && /^#[0-9a-fA-F]{6}$/.test(s.btnColorHex)
    ? s.btnColorHex : DEFAULT_SETTINGS.btnColorHex;
  s.carouselIntervalSec = clampNumber(Number(s.carouselIntervalSec), 2, 30);
  s.carouselShuffle = Boolean(s.carouselShuffle);
  s.carouselTransitionMs = clampNumber(Number(s.carouselTransitionMs), 200, 3000);
  s.carouselPaused = Boolean(s.carouselPaused);
  s.pauseWhenHidden = Boolean(s.pauseWhenHidden);
  return s;
}

function applyCssVars(settings) {
  const root = document.documentElement;
  root.style.setProperty('--search-top', `${settings.searchTopPercent}%`);
  root.style.setProperty('--search-width', `${settings.searchWidthPx}px`);
  root.style.setProperty('--search-height', `${settings.searchHeightPx}px`);
  root.style.setProperty('--search-radius', `${settings.searchRadiusPx}px`);
  root.style.setProperty('--search-opacity', settings.searchOpacityPercent / 100);
  root.style.setProperty('--search-text-color', settings.searchTextColorHex); // 新增文字颜色变量
  root.style.setProperty('--button-margin-top', `${settings.buttonMarginTopPx}px`);
  root.style.setProperty('--carousel-transition-ms', `${settings.carouselTransitionMs}ms`);
  root.style.setProperty('--btn-font-size', `${settings.btnFontSize}px`);
  root.style.setProperty('--btn-radius', `${settings.btnRadiusPx}px`);
  root.style.setProperty('--btn-padding-v', `${settings.btnPaddingV}px`);
  root.style.setProperty('--btn-padding-h', `${settings.btnPaddingH}px`);
  root.style.setProperty('--btn-color', settings.btnColorHex);
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('myedgenewtab', 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('images')) {
        const store = db.createObjectStore('images', { keyPath: 'id' });
        store.createIndex('addedAt', 'addedAt', { unique: false });
      }
        if (!db.objectStoreNames.contains('folderSource')) {
          db.createObjectStore('folderSource', { keyPath: 'id' });
        }

    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore(mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('images', mode);
    const store = tx.objectStore('images');
    const resultPromise = Promise.resolve().then(() => fn(store));
    tx.oncomplete = () => resolve(resultPromise);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function withObjectStore(storeName, mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const resultPromise = Promise.resolve().then(() => fn(store));
    tx.oncomplete = () => resolve(resultPromise);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}


function genId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function addImportedImages(files) {
  const fileList = Array.from(files || []).filter(f => f && (
      (typeof f.type === 'string' && f.type.startsWith('image/')) ||
      (typeof f.name === 'string' && /\.(png|jpe?g|webp|gif|bmp|svg|avif)$/i.test(f.name))
    ));
  if (fileList.length === 0) return { added: 0, failed: 0 };
  const now = Date.now();
  await withStore('readwrite', store => {
    return new Promise((resolve, reject) => {
      let completed = 0;
      let hasError = false;
      for (const file of fileList) {
        const record = { id: genId(), name: file.name || 'image', type: file.type || (() => { const ext = (file.name || '').split('.').pop().toLowerCase(); return ({ png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', bmp: 'image/bmp', svg: 'image/svg+xml', avif: 'image/avif' })[ext] || 'image/png'; })(), size: Number(file.size) || 0, addedAt: now, blob: file };
        const req = store.put(record);
        req.onsuccess = () => { completed++; if (completed === fileList.length && !hasError) resolve(); };
        req.onerror = () => { hasError = true; reject(req.error); };
      }
    });
  });
  return { added: fileList.length, failed: 0 };
}

async function listImportedImages() {
  const rows = await withStore('readonly', store => {
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  });
  return rows.slice().sort((a, b) => (Number(b.addedAt) || 0) - (Number(a.addedAt) || 0)).map(r => ({ id: r.id, name: r.name, addedAt: r.addedAt }));
}

async function getImportedBlob(id) {
  const row = await withStore('readonly', store => {
    return new Promise((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  });
  return row?.blob || null;
}

async function deleteImportedImage(id) {
  await withStore('readwrite', store => store.delete(id));
}

async function clearImportedImages() {
  await withStore('readwrite', store => store.clear());
}

// 导出已导入图片到用户指定的本地文件夹
function sanitizeFilename(name) {
  let s = String(name || '').replace(/[\\/:*?"<>|]/g, '_').trim();
  // 去除控制字符
  s = s.replace(/[\u0000-\u001f\u007f]/g, '');
  if (!s) s = 'image';
  if (s.length > 200) s = s.slice(0, 200);
  return s;
}

// 若目标文件夹已存在同名文件，自动追加 _2、_3 等后缀避免覆盖
async function ensureUniqueName(dirHandle, baseName) {
  async function exists(n) {
    try { await dirHandle.getFileHandle(n); return true; } catch (e) { return false; }
  }
  if (!(await exists(baseName))) return baseName;
  const dotIdx = baseName.lastIndexOf('.');
  const hasExt = dotIdx > 0 && dotIdx < baseName.length - 1;
  const stem = hasExt ? baseName.slice(0, dotIdx) : baseName;
  const ext = hasExt ? baseName.slice(dotIdx) : '';
  let n = 2;
  while (await exists(`${stem}_${n}${ext}`)) n++;
  return `${stem}_${n}${ext}`;
}

async function exportImagesToFolder(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return;
  if (!window.showDirectoryPicker) {
    alert('当前浏览器不支持选择导出文件夹（需要 File System Access API）。请使用较新版本的 Edge 或 Chrome 浏览器。');
    return;
  }
  let dirHandle;
  try {
    dirHandle = await window.showDirectoryPicker();
  } catch (e) {
    if (e && e.name === 'AbortError') return; // 用户取消
    alert('未能选择导出文件夹');
    return;
  }
  try {
    const perm = await dirHandle.requestPermission({ mode: 'readwrite' });
    if (perm !== 'granted') { alert('未获得该文件夹的写入权限，已取消导出。'); return; }
  } catch (e) {
    alert('无法获取文件夹写入权限，已取消导出。');
    return;
  }

  const metaList = await listImportedImages();
  const nameMap = new Map(metaList.map(m => [m.id, m.name]));

  let ok = 0, fail = 0;
  for (const id of ids) {
    try {
      const blob = await getImportedBlob(id);
      if (!blob) { fail++; continue; }
      const rawName = nameMap.get(id) || `image_${id}`;
      const fileName = await ensureUniqueName(dirHandle, sanitizeFilename(rawName) || `image_${id}`);
      const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      ok++;
    } catch (e) {
      console.error('导出图片失败：', e);
      fail++;
    }
  }
  let msg = `导出完成：成功 ${ok} 张`;
  if (fail) msg += `，失败 ${fail} 张`;
  alert(msg);
}

async function saveFolderSource(handle, name) {
  await withObjectStore('folderSource', 'readwrite', store => store.put({ id: 'default', handle, name, updatedAt: Date.now() }));
}

async function getFolderSource() {
  const row = await withObjectStore('folderSource', 'readonly', store => {
    return new Promise((resolve, reject) => {
      const req = store.get('default');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  });
  return row || null;
}

async function clearFolderSource() {
  await withObjectStore('folderSource', 'readwrite', store => store.delete('default'));
}

async function ensureFolderPermission(handle) {
  if (!handle) return false;
  try {
    if (handle.queryPermission) {
      const state = await handle.queryPermission({ mode: 'read' });
      if (state === 'granted') return true;
    }
    if (handle.requestPermission) {
      const state = await handle.requestPermission({ mode: 'read' });
      return state === 'granted';
    }
    return true;
  } catch (e) {
    return false;
  }
}

async function listFolderImages(handle) {
  if (!handle) return [];
  const allowed = await ensureFolderPermission(handle);
  if (!allowed) return [];
  const results = [];
  async function walk(dirHandle, prefix) {
    let entries = [];
    try {
      for await (const entry of dirHandle.values()) entries.push(entry);
    } catch (e) {
      return;
    }
    for (const entry of entries) {
      if (entry.kind === 'file') {
        if (/\.(png|jpe?g|webp|gif|bmp|svg|avif)$/i.test(entry.name)) {
          results.push({ name: prefix ? `${prefix}/${entry.name}` : entry.name, handle: entry });
        }
      } else if (entry.kind === 'directory') {
        await walk(entry, prefix ? `${prefix}/${entry.name}` : entry.name);
      }
    }
  }
  await walk(handle, '');
  return results.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}


class ObjectUrlCache {
  constructor(maxSize) { this.maxSize = maxSize; this.map = new Map(); }
  get(id) { const url = this.map.get(id); if (!url) return null; this.map.delete(id); this.map.set(id, url); return url; }
  set(id, url) { const old = this.map.get(id); if (old) URL.revokeObjectURL(old); this.map.delete(id); this.map.set(id, url); while (this.map.size > this.maxSize) { const firstKey = this.map.keys().next().value; const firstUrl = this.map.get(firstKey); this.map.delete(firstKey); if (firstUrl) URL.revokeObjectURL(firstUrl); } }
  clear() { for (const url of this.map.values()) URL.revokeObjectURL(url); this.map.clear(); }
}

class CarouselController {
  constructor() {
    this.items = []; this.order = []; this.currentOrderIndex = 0; this.timer = null;
    this.settings = normalizeSettings(DEFAULT_SETTINGS); this.urlCache = new ObjectUrlCache(3);
  }
  async setItems(items) {
    this.items = Array.isArray(items) ? items.slice() : [];
    this.rebuildOrder();
    await this.showInitial();
    this.scheduleNext();
  }
  setSettings(settings) {
    this.settings = normalizeSettings(settings);
    applyCssVars(this.settings);
    if (this.settings.carouselPaused) this.stop();
    else this.scheduleNext(true);
  }
  rebuildOrder() {
    const indices = Array.from({ length: this.items.length }, (_, i) => i);
    if (this.settings.carouselShuffle) {
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
    }
    this.order = indices;
    this.currentOrderIndex = Math.min(this.currentOrderIndex, Math.max(0, this.order.length - 1));
  }
  stop() { if (this.timer) clearTimeout(this.timer); this.timer = null; }
  scheduleNext(forceRestart = false) {
    if (forceRestart) this.stop();
    if (this.timer) return;
    if (this.settings.carouselPaused) return;
    if (!this.items.length) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.showNext().finally(() => this.scheduleNext());
    }, this.settings.carouselIntervalSec * 1000);
  }
  async showInitial() {
    if (!this.items.length) {
      layers[0].style.backgroundImage = 'none';
      layers[1].style.backgroundImage = 'none';
      return;
    }
    const randomIndex = Math.floor(Math.random() * this.items.length);
    this.currentOrderIndex = this.order.indexOf(randomIndex);
    if (this.currentOrderIndex < 0) this.currentOrderIndex = 0;
    const item = this.items[this.order[this.currentOrderIndex]];
    const css = await this.getCssBackground(item);
    layers[0].style.backgroundImage = css || 'none';
    layers[0].classList.add('active');
    const nextItem = this.peekNextItem();
    if (nextItem) { const nextUrl = await this.getPreloadUrl(nextItem); this.preload(nextUrl); }
  }
  peekNextItem() {
    if (!this.items.length) return null;
    const nextOrderIndex = (this.currentOrderIndex + 1) % this.order.length;
    return this.items[this.order[nextOrderIndex]];
  }
  async showNext() {
    if (!this.items.length) return;
    const activeLayer = document.querySelector('.background-layer.active');
    const inactiveLayer = document.querySelector('.background-layer:not(.active)');
    if (!activeLayer || !inactiveLayer) return;
    const nextOrderIndex = (this.currentOrderIndex + 1) % this.order.length;
    const item = this.items[this.order[nextOrderIndex]];
    const preloadUrl = await this.getPreloadUrl(item);
    const ok = await this.preload(preloadUrl);
    if (ok) { const css = await this.getCssBackground(item); inactiveLayer.style.backgroundImage = css || 'none'; }
    else { inactiveLayer.style.backgroundImage = 'none'; }
    await new Promise(r => setTimeout(r, 30));
    activeLayer.classList.remove('active');
    inactiveLayer.classList.add('active');
    this.currentOrderIndex = nextOrderIndex;
    const nextNextItem = this.peekNextItem();
    if (nextNextItem) { const nextNextUrl = await this.getPreloadUrl(nextNextItem); this.preload(nextNextUrl); }
  }
  async getCssBackground(item) {
    // packaged removed
    if (item?.type === 'imported') { const url = await this.getImportedUrl(item.id); return url ? escapeCssUrl(url) : null; }
      if (item?.type === 'folder') { const url = await this.getFolderUrl(item); return url ? escapeCssUrl(url) : null; }

    return null;
  }
  async getPreloadUrl(item) {
    // packaged removed
      if (item?.type === 'folder') return this.getFolderUrl(item);

    if (item?.type === 'imported') return this.getImportedUrl(item.id);
    return null;
  }
  async getImportedUrl(id) {
    const cached = this.urlCache.get(id);
    if (cached) return cached;
    const blob = await getImportedBlob(id);
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    this.urlCache.set(id, url);
    return url;
  }
    async getFolderUrl(item) {
      const cached = this.urlCache.get(item.id);
      if (cached) return cached;
      try {
        const file = await item.handle.getFile();
        const url = URL.createObjectURL(file);
        this.urlCache.set(item.id, url);
        return url;
      } catch (e) {
        return null;
      }
    }

  preload(url) {
    if (!url) return Promise.resolve(false);
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }
  onVisibilityChange(hidden) {
    if (!this.settings.pauseWhenHidden) return;
    if (hidden) this.stop();
    else this.scheduleNext(true);
  }
  dispose() { this.stop(); this.urlCache.clear(); }
}

function setupSearch() {
  function performSearch() {
    const query = searchInput.value.trim();
    if (query) {
      const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
      window.open(searchUrl, '_self');
    }
  }
  searchButton.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', e => { if (e.key === 'Enter') performSearch(); });
}

function setupSettingsUi(controllers) {
  const settingsButton = document.getElementById('settings-button');
  const overlay = document.getElementById('settings-overlay');
  const drawer = document.getElementById('settings-drawer');
  const closeBtn = document.getElementById('settings-close');
  function open() { overlay.hidden = false; drawer.focus?.(); }
  function close() { overlay.hidden = true; }
  settingsButton.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => { if (!overlay.hidden && e.key === 'Escape') close(); });

  // 设置可折叠sections的事件监听
  const toggleButtons = document.querySelectorAll('.section-toggle');
  toggleButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const sectionId = button.getAttribute('data-section');
      const contentEl = document.getElementById(sectionId);
      if (contentEl) {
        const willExpand = contentEl.hidden;
        contentEl.hidden = !willExpand;
        button.classList.toggle('expanded', willExpand);
      }
    });
  });

  const el = id => document.getElementById(id);
  const sourceImported = el('setting-image-source-imported');
  // 内置图片库已移除
  // 内置图片库已移除
  const importedSection = el('imported-section');
  const fileImportBtn = el('file-import-btn');
  const importInput = el('import-input');
  const clearImported = el('clear-imported');
  const importedCount = el('imported-count');
  const previewGrid = el('preview-grid');
    const folderImportBtn = el('folder-import-btn');
    const folderImportInput = el('folder-import-input');
    const selectionBar = el('imported-selection-bar');
    const selectAllImported = el('select-all-imported');
    const deleteSelectedImported = el('delete-selected-imported');
    const selectedCount = el('selected-count');
    const exportSelectedImported = el('export-selected-imported');
    const exportSelectedCount = el('export-selected-count');
    const exportAllImported = el('export-all-imported');
    const selectedIds = new Set();
    const sourceFolder = el('setting-image-source-folder');
    const folderSection = el('folder-section');
    const folderName = el('folder-name');
    const folderSelectBtn = el('folder-select-btn');
    const folderClearBtn = el('folder-clear-btn');
    const folderViewBtn = el('folder-view-btn');
    const folderTip = el('folder-tip');

    const openImportedPreview = el('open-imported-preview');
    const previewModal = el('preview-modal');
    const previewModalPanel = el('preview-modal-panel');
    const previewModalClose = el('preview-modal-close');
    const previewModalBackdrop = el('preview-modal-backdrop');
    const previewModalTitle = el('preview-modal-title');
    const PREVIEW_PAGE_SIZE = 40;
    let previewModalOpen = false;
    let previewLoadedCount = 0;
    const previewObjectUrls = new Set();



  const checkShuffle = el('setting-carousel-shuffle');
  const checkPaused = el('setting-carousel-paused');
  const checkPauseWhenHidden = el('setting-pause-when-hidden');

  let currentSettings = controllers.settings;
    // 把导入图片的预览和选择栏移动到中间浮窗中，设置面板默认不再被大量缩略图撑高
    if (previewModalPanel && selectionBar) previewModalPanel.appendChild(selectionBar);
    if (previewModalPanel && previewGrid) previewModalPanel.appendChild(previewGrid);


  async function save(patch) {
    currentSettings = normalizeSettings({ ...currentSettings, ...patch });
    controllers.settings = currentSettings;
    await storage.set(currentSettings);
    controllers.carousel.setSettings(currentSettings);
    applyCssVars(currentSettings);
  }

  function setRangeValue(rangeEl, valueEl, value, fmt) {
    rangeEl.value = String(value);
    valueEl.textContent = fmt(value);
  }

    function updateSelectionUi() {
      const checkboxes = previewGrid.querySelectorAll('.preview-item-checkbox');
      const total = checkboxes.length;
      const selectedTotal = selectedIds.size;
      if (selectAllImported) {
        selectAllImported.checked = total > 0 && selectedTotal === total;
        selectAllImported.indeterminate = selectedTotal > 0 && selectedTotal < total;
      }
      if (deleteSelectedImported) {
        deleteSelectedImported.disabled = selectedTotal === 0;
        if (selectedCount) selectedCount.textContent = String(selectedTotal);
      }
      if (exportSelectedImported) {
        exportSelectedImported.disabled = selectedTotal === 0;
        if (exportSelectedCount) exportSelectedCount.textContent = String(selectedTotal);
      }
      if (selectionBar) {
        selectionBar.hidden = !previewModalOpen || currentSettings.imageSource !== 'imported' || total === 0;
      }
    }



    async function renderPreviewGrid() {
      if (!previewModalOpen) {
          for (const url of previewObjectUrls) URL.revokeObjectURL(url);
          previewObjectUrls.clear();

        previewGrid.innerHTML = '';
        updateSelectionUi();
        return;
      }
        for (const url of previewObjectUrls) URL.revokeObjectURL(url);
        previewObjectUrls.clear();

      previewGrid.innerHTML = '';
      let items = [];
      if (currentSettings.imageSource === 'imported') {
        const importedList = await listImportedImages();
        items = importedList.map(x => ({ id: x.id, name: x.name, type: 'imported' }));
        if (previewModalTitle) previewModalTitle.textContent = '已导入图片';
      } else if (currentSettings.imageSource === 'folder') {
        const folder = await getFolderSource();
        if (folder?.handle) {
          const files = await listFolderImages(folder.handle);
          items = files.map((f, i) => ({ type: 'folder', id: `folder-${i}-${f.name}`, name: f.name, handle: f.handle }));
        }
        if (previewModalTitle) previewModalTitle.textContent = folder?.name ? `文件夹图片：${folder.name}` : '文件夹图片';
      }
        if (!previewModalOpen) {
          for (const url of previewObjectUrls) URL.revokeObjectURL(url);
          previewObjectUrls.clear();
          previewGrid.innerHTML = '';
          updateSelectionUi();
          return;
        }


      const validImportedIds = new Set(items.filter(x => x.type === 'imported').map(x => x.id));
      for (const id of Array.from(selectedIds)) {
        if (!validImportedIds.has(id)) selectedIds.delete(id);
      }

      if (previewLoadedCount <= 0) previewLoadedCount = PREVIEW_PAGE_SIZE;

      if (items.length === 0) {
        selectedIds.clear();
        updateSelectionUi();
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'preview-empty';
        emptyDiv.textContent = currentSettings.imageSource === 'folder' ? '该文件夹中没有找到图片' : '暂无导入图片';
        previewGrid.appendChild(emptyDiv);
        return;
      }

      const visibleItems = items.slice(0, previewLoadedCount);
      for (const item of visibleItems) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'preview-item';
        try {
          let url = null;
          if (item.type === 'folder') {
            const file = await item.handle.getFile();
            if (file) url = URL.createObjectURL(file);
              if (url) previewObjectUrls.add(url);

          } else {
            const blob = await getImportedBlob(item.id);
            if (blob) url = URL.createObjectURL(blob);
              if (url) previewObjectUrls.add(url);

          }
          if (url) itemDiv.style.backgroundImage = `url("${url}")`;
        } catch (e) { console.error('Failed to load preview image:', e); }
        if (item.type === 'imported') {
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.className = 'preview-item-checkbox';
          checkbox.dataset.id = item.id;
          checkbox.checked = selectedIds.has(item.id);
          checkbox.title = '选择';
          checkbox.addEventListener('change', () => {
            if (checkbox.checked) selectedIds.add(item.id);
            else selectedIds.delete(item.id);
            itemDiv.classList.toggle('selected', checkbox.checked);
            updateSelectionUi();
          });
          if (checkbox.checked) itemDiv.classList.add('selected');
          itemDiv.appendChild(checkbox);

          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'preview-item-delete'; deleteBtn.type = 'button'; deleteBtn.textContent = '×'; deleteBtn.title = '删除';
          deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            selectedIds.delete(item.id);
            await deleteImportedImage(item.id);
            await renderPreviewGrid();
            await controllers.refreshImages();
            const newCount = await listImportedImages();
            importedCount.textContent = String(newCount.length);
          });
          itemDiv.appendChild(deleteBtn);
        }
        previewGrid.appendChild(itemDiv);
      }

      if (items.length > previewLoadedCount) {
        const moreBtn = document.createElement('button');
        moreBtn.type = 'button';
        moreBtn.className = 'load-more-btn';
        moreBtn.textContent = `加载更多（还剩 ${items.length - previewLoadedCount} 张）`;
        moreBtn.addEventListener('click', () => {
          previewLoadedCount += PREVIEW_PAGE_SIZE;
          renderPreviewGrid();
        });
        previewGrid.appendChild(moreBtn);
      }
      updateSelectionUi();
    }


  async function handleSourceChange(source) {
    currentSettings = normalizeSettings({ ...currentSettings, imageSource: source });
    sourceImported.checked = source === 'imported';
    // 内置图片库已移除
    sourceFolder.checked = source === 'folder';
    // 内置图片库已移除
    folderSection.hidden = source !== 'folder';
    importedSection.hidden = source !== 'imported';
      previewLoadedCount = 0;

    await save({ imageSource: source });
    await renderPreviewGrid();
    await controllers.refreshImages();
  }
  sourceImported.addEventListener('change', () => handleSourceChange('imported'));
    sourceFolder.addEventListener('change', () => handleSourceChange('folder'));

  // 内置图片库已移除

  fileImportBtn.addEventListener('click', () => importInput.click());
  importInput.addEventListener('change', async () => {
    const files = importInput.files;
    if (files && files.length) {
      await addImportedImages(files);
        selectedIds.clear();

      importInput.value = '';
      await renderPreviewGrid();
      await controllers.refreshImages();
      importedCount.textContent = String((await listImportedImages()).length);
    }
  });
  clearImported.addEventListener('click', async () => {
    if (confirm('确定要清空所有导入的图片吗？')) {
        selectedIds.clear();

      await clearImportedImages();
      controllers.carousel.urlCache.clear();
      await renderPreviewGrid();
      await controllers.refreshImages();
      importedCount.textContent = '0';
    }
  });

    folderImportBtn.addEventListener('click', () => folderImportInput.click());
    folderImportInput.addEventListener('change', async () => {
      const files = folderImportInput.files;
      if (files && files.length) {
        const imageFiles = Array.from(files).filter(f => f && (
            (typeof f.type === 'string' && f.type.startsWith('image/')) ||
            (typeof f.name === 'string' && /\.(png|jpe?g|webp|gif|bmp|svg|avif)$/i.test(f.name))
          ));
        if (imageFiles.length === 0) {
          alert('所选文件夹中没有找到图片');
        } else {
          await addImportedImages(imageFiles);
          selectedIds.clear();
          folderImportInput.value = '';
          await renderPreviewGrid();
          await controllers.refreshImages();
          importedCount.textContent = String((await listImportedImages()).length);
        }
      }
      folderImportInput.value = '';

    });

    function openPreviewModal() {
      previewModalOpen = true;
      previewModal.hidden = false;
      previewLoadedCount = 0;
      renderPreviewGrid();
    }

    function closePreviewModal() {
      previewModalOpen = false;
      previewModal.hidden = true;
        for (const url of previewObjectUrls) URL.revokeObjectURL(url);
        previewObjectUrls.clear();

      previewGrid.innerHTML = '';
      updateSelectionUi();
    }

    openImportedPreview.addEventListener('click', () => {
      if (previewModalTitle) previewModalTitle.textContent = '已导入图片';
      openPreviewModal();
    });
    previewModalClose.addEventListener('click', closePreviewModal);
    previewModalBackdrop.addEventListener('click', closePreviewModal);
    document.addEventListener('keydown', e => {
      if (!previewModal.hidden && e.key === 'Escape') closePreviewModal();
    });

    folderSelectBtn.addEventListener('click', async () => {
      if (!window.showDirectoryPicker) {
        alert('当前浏览器不支持直接选择本地文件夹，请使用“导入我的图片”中的文件夹导入。');
        return;
      }
      try {
        const handle = await window.showDirectoryPicker();
        const permission = await ensureFolderPermission(handle);
        if (!permission) {
          alert('无法读取该文件夹');
          return;
        }
        await saveFolderSource(handle, handle.name || '未命名文件夹');
        if (folderName) folderName.textContent = handle.name || '未命名文件夹';
        if (folderTip) folderTip.hidden = false;
        if (currentSettings.imageSource !== 'folder') {
          await handleSourceChange('folder');
        } else {
          await controllers.refreshImages();
          if (previewModalOpen) renderPreviewGrid();
        }
      } catch (e) {
        if (e && e.name !== 'AbortError') console.error(e);
      }
    });

    folderClearBtn.addEventListener('click', async () => {
      if (!confirm('确定要清除本地文件夹图源吗？')) return;
      await clearFolderSource();
      if (folderName) folderName.textContent = '未选择';
      if (folderTip) folderTip.hidden = true;
      await controllers.refreshImages();
      if (previewModalOpen) renderPreviewGrid();
    });

    folderViewBtn.addEventListener('click', () => {
      if (previewModalTitle) previewModalTitle.textContent = '文件夹图片';
      openPreviewModal();
    });


    selectAllImported.addEventListener('change', () => {
      const checkboxes = previewGrid.querySelectorAll('.preview-item-checkbox');
      checkboxes.forEach(cb => {
        cb.checked = selectAllImported.checked;
        const id = cb.dataset.id;
        if (id) {
          if (cb.checked) selectedIds.add(id);
          else selectedIds.delete(id);
        }
        const itemDiv = cb.closest('.preview-item');
        if (itemDiv) itemDiv.classList.toggle('selected', cb.checked);
      });
      updateSelectionUi();
    });

    deleteSelectedImported.addEventListener('click', async () => {
      const ids = Array.from(selectedIds);
      if (ids.length === 0) return;
      if (!confirm(`确定要删除选中的 ${ids.length} 张图片吗？`)) return;
      await Promise.all(ids.map(id => deleteImportedImage(id)));
      selectedIds.clear();
      controllers.carousel.urlCache.clear();
      await renderPreviewGrid();
      await controllers.refreshImages();
      importedCount.textContent = String((await listImportedImages()).length);
    });

    if (exportAllImported) {
      exportAllImported.addEventListener('click', async () => {
        const list = await listImportedImages();
        if (list.length === 0) { alert('暂无已导入图片，无法导出。'); return; }
        await exportImagesToFolder(list.map(x => x.id));
      });
    }

    if (exportSelectedImported) {
      exportSelectedImported.addEventListener('click', async () => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;
        await exportImagesToFolder(ids);
      });
    }


  const rangeIds = [
    ['setting-search-top', 'setting-search-top-value', 'searchTopPercent', v => `${v}%`],
    ['setting-search-width', 'setting-search-width-value', 'searchWidthPx', v => `${v}px`],
    ['setting-search-height', 'setting-search-height-value', 'searchHeightPx', v => `${v}px`],
    ['setting-search-radius', 'setting-search-radius-value', 'searchRadiusPx', v => `${v}px`],
    ['setting-search-opacity', 'setting-search-opacity-value', 'searchOpacityPercent', v => `${v}%`],
    ['setting-button-margin-top', 'setting-button-margin-top-value', 'buttonMarginTopPx', v => `${v}px`],
    ['setting-btn-font-size', 'setting-btn-font-size-value', 'btnFontSize', v => `${v}px`],
    ['setting-btn-radius', 'setting-btn-radius-value', 'btnRadiusPx', v => `${v}px`],
    ['setting-btn-padding-v', 'setting-btn-padding-v-value', 'btnPaddingV', v => `${v}px`],
    ['setting-btn-padding-h', 'setting-btn-padding-h-value', 'btnPaddingH', v => `${v}px`],
    ['setting-carousel-interval', 'setting-carousel-interval-value', 'carouselIntervalSec', v => `${v}s`],
    ['setting-carousel-transition', 'setting-carousel-transition-value', 'carouselTransitionMs', v => `${v}ms`],
  ];
  for (const [rangeId, valueId, key, fmt] of rangeIds) {
    const rangeEl = el(rangeId);
    const valueEl = el(valueId);
    const syncProgress = () => {
      const min = Number(rangeEl.min) || 0;
      const max = Number(rangeEl.max) || 100;
      const val = Number(rangeEl.value);
      const pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
      rangeEl.style.setProperty('--range-progress', `${pct}%`);
    };
    const handler = async () => {
      const num = Number(rangeEl.value);
      valueEl.textContent = fmt(num);
      await save({ [key]: num });
    };
    rangeEl.addEventListener('input', () => {
      const num = Number(rangeEl.value);
      valueEl.textContent = fmt(num);
      syncProgress();
      applyCssVars(normalizeSettings({ ...currentSettings, [key]: num }));
    });
    rangeEl.addEventListener('change', handler);
    syncProgress();
  }

  const btnColorPicker = el('setting-btn-color');
  if (btnColorPicker) {
    btnColorPicker.addEventListener('input', () => applyCssVars(normalizeSettings({ ...currentSettings, btnColorHex: btnColorPicker.value })));
    btnColorPicker.addEventListener('change', async () => await save({ btnColorHex: btnColorPicker.value }));
  }

  // 新增：搜索框文字颜色控制
  const searchTextColorPicker = el('setting-search-text-color');
  const searchTextColorValue = el('setting-search-text-color-value');
  if (searchTextColorPicker && searchTextColorValue) {
    searchTextColorPicker.addEventListener('input', () => {
      const color = searchTextColorPicker.value;
      searchTextColorValue.textContent = color;
      applyCssVars(normalizeSettings({ ...currentSettings, searchTextColorHex: color }));
    });
    searchTextColorPicker.addEventListener('change', async () => {
      const color = searchTextColorPicker.value;
      searchTextColorValue.textContent = color;
      await save({ searchTextColorHex: color });
    });
  }

  checkShuffle.addEventListener('change', async () => { await save({ carouselShuffle: checkShuffle.checked }); await controllers.refreshImages(); });
  checkPaused.addEventListener('change', async () => await save({ carouselPaused: checkPaused.checked }));
  checkPauseWhenHidden.addEventListener('change', async () => await save({ pauseWhenHidden: checkPauseWhenHidden.checked }));

  const resetBtn = el('reset-settings-btn');
  resetBtn.addEventListener('click', async () => {
    if (confirm('确定要恢复所有设置为默认值吗？')) {
        selectedIds.clear();

      await save(DEFAULT_SETTINGS);
      syncUi(currentSettings);
      await renderPreviewGrid();
      await controllers.refreshImages();
    }
  });

  function syncUi(settings) {
    sourceImported.checked = settings.imageSource === 'imported';
    // 内置图片库已移除
      sourceFolder.checked = settings.imageSource === 'folder';
    // 内置图片库已移除
      folderSection.hidden = settings.imageSource !== 'folder';
    importedSection.hidden = settings.imageSource !== 'imported';
    for (const [rangeId, valueId, key, fmt] of rangeIds) {
      const rangeEl = el(rangeId);
      const valueEl = el(valueId);
      setRangeValue(rangeEl, valueEl, settings[key], fmt);
      // 同步进度条 --range-progress（reset 时 JS 改 value 不触发 input 事件，需手动刷新）
      const min = Number(rangeEl.min) || 0;
      const max = Number(rangeEl.max) || 100;
      const pct = max > min ? ((Number(rangeEl.value) - min) / (max - min)) * 100 : 0;
      rangeEl.style.setProperty('--range-progress', `${pct}%`);
    }
    if (btnColorPicker) btnColorPicker.value = settings.btnColorHex;
    // 同步文字颜色取值
    if (searchTextColorPicker) {
      searchTextColorPicker.value = settings.searchTextColorHex;
      if (searchTextColorValue) searchTextColorValue.textContent = settings.searchTextColorHex;
    }
    checkShuffle.checked = settings.carouselShuffle;
    checkPaused.checked = settings.carouselPaused;
    checkPauseWhenHidden.checked = settings.pauseWhenHidden;
  }
  syncUi(currentSettings);
    getFolderSource().then(folder => {
      if (folderName) folderName.textContent = folder?.name || '未选择';
      if (folderTip) folderTip.hidden = !folder;
    }).catch(() => {});


  listImportedImages().then(items => {
    importedCount.textContent = String(items.length);
    renderPreviewGrid();
  }).catch(() => {
    importedCount.textContent = '0';
    renderPreviewGrid();
  });
}

async function loadSettings() {
  const saved = await storage.get();
  return normalizeSettings(saved);
}

async function buildImageItems(settings) {
  const imported = await listImportedImages();
  const importedItems = imported.map(x => ({ type: 'imported', id: x.id, name: x.name }));
  // 内置图片库已移除
    let packagedItems = [];

  // 内置图片库已移除
  let folderItems = [];
  if (settings.imageSource === 'folder') {
    const folder = await getFolderSource();
    if (folder?.handle) {
      const files = await listFolderImages(folder.handle);
      folderItems = files.map((f, i) => ({ type: 'folder', id: `folder-${i}-${f.name}`, name: f.name, handle: f.handle }));
    }
  }

  const preferred = settings.imageSource === 'folder' ? folderItems : importedItems;
  const fallback = importedItems;
  return preferred.length ? preferred : fallback;
}

(async () => {
  setupSearch();
  const settings = await loadSettings();
  applyCssVars(settings);
  const carousel = new CarouselController();
  carousel.setSettings(settings);
  const controllers = {
    settings,
    carousel,
    refreshImages: async () => {
      const items = await buildImageItems(controllers.settings);
      carousel.urlCache.clear();
      carousel.rebuildOrder();
      await carousel.setItems(items);
    },
  };
  setupSettingsUi(controllers);
  await controllers.refreshImages();
  document.addEventListener('visibilitychange', () => {
    carousel.onVisibilityChange(document.visibilityState === 'hidden');
  });
})();