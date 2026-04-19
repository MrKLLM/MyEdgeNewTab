const DEFAULT_SETTINGS = Object.freeze({
    imageSource: 'imported', // imported | packaged
    searchTopPercent: 25,
    searchWidthPx: 550,
    searchHeightPx: 23,
    searchRadiusPx: 24,
    buttonMarginTopPx: 23,
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

function getPackagedImageUrl(imgName) {
    if (imgName.includes('%20')) return `images/${imgName.replace(/%20/g, '%2520')}`;
    if (imgName.includes(' ')) return `images/${imgName.replace(/ /g, '%20')}`;
    return `images/${imgName}`;
}

function getCorrectPackagedCssBackground(imgName) {
    return escapeCssUrl(getPackagedImageUrl(imgName));
}

const storage = {
    async get() {
        try {
            if (globalThis.chrome?.storage?.local) {
                const result = await new Promise(resolve => chrome.storage.local.get([SETTINGS_KEY], resolve));
                return result?.[SETTINGS_KEY] ?? null;
            }
        } catch (_) {
            // ignore
        }
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (_) {
            return null;
        }
    },
    async set(value) {
        try {
            if (globalThis.chrome?.storage?.local) {
                await new Promise(resolve => chrome.storage.local.set({ [SETTINGS_KEY]: value }, resolve));
                return;
            }
        } catch (_) {
            // ignore
        }
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(value));
        } catch (_) {
            // ignore
        }
    },
};

function normalizeSettings(settings) {
    const s = { ...DEFAULT_SETTINGS, ...(settings || {}) };
    s.imageSource = s.imageSource === 'packaged' ? 'packaged' : 'imported';
    s.searchTopPercent = clampNumber(Number(s.searchTopPercent), 5, 60);
    s.searchWidthPx = clampNumber(Number(s.searchWidthPx), 280, 900);
    s.searchHeightPx = clampNumber(Number(s.searchHeightPx), 18, 60);
    s.searchRadiusPx = clampNumber(Number(s.searchRadiusPx), 0, 40);
    s.buttonMarginTopPx = clampNumber(Number(s.buttonMarginTopPx), 0, 60);
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
    root.style.setProperty('--button-margin-top', `${settings.buttonMarginTopPx}px`);
    root.style.setProperty('--carousel-transition-ms', `${settings.carouselTransitionMs}ms`);
}

function openDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('myedgenewtab', 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('images')) {
                const store = db.createObjectStore('images', { keyPath: 'id' });
                store.createIndex('addedAt', 'addedAt', { unique: false });
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

function genId() {
    if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function addImportedImages(files) {
    const fileList = Array.from(files || []).filter(f => f && typeof f.type === 'string' && f.type.startsWith('image/'));
    if (fileList.length === 0) return { added: 0, failed: 0 };

    const now = Date.now();
    await withStore('readwrite', store => {
        for (const file of fileList) {
            const record = {
                id: genId(),
                name: file.name || 'image',
                type: file.type || 'image/*',
                size: Number(file.size) || 0,
                addedAt: now,
                blob: file,
            };
            store.put(record);
        }
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
    return rows
        .slice()
        .sort((a, b) => (Number(b.addedAt) || 0) - (Number(a.addedAt) || 0))
        .map(r => ({ id: r.id, name: r.name, addedAt: r.addedAt }));
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

async function loadPackagedImageList() {
    const response = await fetch('image-list.json');
    if (!response.ok) throw new Error('未找到图片清单文件');
    const list = await response.json();
    if (!Array.isArray(list)) return [];
    return list.filter(x => typeof x === 'string' && x.length > 0);
}

class ObjectUrlCache {
    constructor(maxSize) {
        this.maxSize = maxSize;
        this.map = new Map(); // id -> url
    }
    get(id) {
        const url = this.map.get(id);
        if (!url) return null;
        this.map.delete(id);
        this.map.set(id, url);
        return url;
    }
    set(id, url) {
        const old = this.map.get(id);
        if (old) URL.revokeObjectURL(old);
        this.map.delete(id);
        this.map.set(id, url);
        while (this.map.size > this.maxSize) {
            const firstKey = this.map.keys().next().value;
            const firstUrl = this.map.get(firstKey);
            this.map.delete(firstKey);
            if (firstUrl) URL.revokeObjectURL(firstUrl);
        }
    }
    clear() {
        for (const url of this.map.values()) URL.revokeObjectURL(url);
        this.map.clear();
    }
}

class CarouselController {
    constructor() {
        this.items = [];
        this.order = [];
        this.currentOrderIndex = 0;
        this.timer = null;
        this.settings = normalizeSettings(DEFAULT_SETTINGS);
        this.urlCache = new ObjectUrlCache(3);
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

    stop() {
        if (this.timer) clearTimeout(this.timer);
        this.timer = null;
    }

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
        if (nextItem) {
            const nextUrl = await this.getPreloadUrl(nextItem);
            this.preload(nextUrl);
        }
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
        if (ok) {
            const css = await this.getCssBackground(item);
            inactiveLayer.style.backgroundImage = css || 'none';
        } else {
            inactiveLayer.style.backgroundImage = 'none';
        }

        await new Promise(r => setTimeout(r, 30));
        activeLayer.classList.remove('active');
        inactiveLayer.classList.add('active');
        this.currentOrderIndex = nextOrderIndex;

        const nextNextItem = this.peekNextItem();
        if (nextNextItem) {
            const nextNextUrl = await this.getPreloadUrl(nextNextItem);
            this.preload(nextNextUrl);
        }
    }

    async getCssBackground(item) {
        if (item?.type === 'packaged') return getCorrectPackagedCssBackground(item.name);
        if (item?.type === 'imported') {
            const url = await this.getImportedUrl(item.id);
            return url ? escapeCssUrl(url) : null;
        }
        return null;
    }

    async getPreloadUrl(item) {
        if (item?.type === 'packaged') return getPackagedImageUrl(item.name);
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

    dispose() {
        this.stop();
        this.urlCache.clear();
    }
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
    searchInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') performSearch();
    });
}

function setupSettingsUi(controllers) {
    const settingsButton = document.getElementById('settings-button');
    const overlay = document.getElementById('settings-overlay');
    const drawer = document.getElementById('settings-drawer');
    const closeBtn = document.getElementById('settings-close');

    function open() {
        overlay.hidden = false;
        drawer.focus?.();
    }
    function close() {
        overlay.hidden = true;
    }

    settingsButton.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', e => {
        if (e.target === overlay) close();
    });
    document.addEventListener('keydown', e => {
        if (!overlay.hidden && e.key === 'Escape') close();
    });

    const el = id => document.getElementById(id);
    const inputImageSource = el('setting-image-source');
    const importInput = el('import-input');
    const importedCount = el('imported-count');
    const importedList = el('imported-list');
    const clearImported = el('clear-imported');

    const rangeIds = [
        ['setting-search-top', 'setting-search-top-value', 'searchTopPercent', v => `${v}%`],
        ['setting-search-width', 'setting-search-width-value', 'searchWidthPx', v => `${v}px`],
        ['setting-search-height', 'setting-search-height-value', 'searchHeightPx', v => `${v}px`],
        ['setting-search-radius', 'setting-search-radius-value', 'searchRadiusPx', v => `${v}px`],
        ['setting-button-margin-top', 'setting-button-margin-top-value', 'buttonMarginTopPx', v => `${v}px`],
        ['setting-carousel-interval', 'setting-carousel-interval-value', 'carouselIntervalSec', v => `${v}s`],
        ['setting-carousel-transition', 'setting-carousel-transition-value', 'carouselTransitionMs', v => `${v}ms`],
    ];

    const checkShuffle = el('setting-carousel-shuffle');
    const checkPaused = el('setting-carousel-paused');
    const checkPauseWhenHidden = el('setting-pause-when-hidden');

    let currentSettings = controllers.settings;

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

    function renderImportedList(items) {
        importedCount.textContent = String(items.length);
        importedList.innerHTML = '';
        const frag = document.createDocumentFragment();
        for (const item of items) {
            const row = document.createElement('div');
            row.className = 'imported-item';

            const name = document.createElement('div');
            name.className = 'imported-name';
            name.title = item.name || item.id;
            name.textContent = item.name || item.id;

            const del = document.createElement('button');
            del.type = 'button';
            del.className = 'imported-delete';
            del.textContent = '删除';
            del.addEventListener('click', async () => {
                await deleteImportedImage(item.id);
                await refreshImported();
                await controllers.refreshImages();
            });

            row.appendChild(name);
            row.appendChild(del);
            frag.appendChild(row);
        }
        importedList.appendChild(frag);
    }

    async function refreshImported() {
        const items = await listImportedImages();
        renderImportedList(items);
    }

    inputImageSource.addEventListener('change', async () => {
        await save({ imageSource: inputImageSource.value });
        await controllers.refreshImages();
    });

    importInput.addEventListener('change', async () => {
        const files = importInput.files;
        if (files && files.length) {
            await addImportedImages(files);
            importInput.value = '';
            await refreshImported();
            await controllers.refreshImages();
        }
    });

    clearImported.addEventListener('click', async () => {
        await clearImportedImages();
        controllers.carousel.urlCache.clear();
        await refreshImported();
        await controllers.refreshImages();
    });

    for (const [rangeId, valueId, key, fmt] of rangeIds) {
        const rangeEl = el(rangeId);
        const valueEl = el(valueId);
        const handler = async () => {
            const num = Number(rangeEl.value);
            valueEl.textContent = fmt(num);
            await save({ [key]: num });
        };
        rangeEl.addEventListener('input', () => {
            const num = Number(rangeEl.value);
            valueEl.textContent = fmt(num);
            applyCssVars(normalizeSettings({ ...currentSettings, [key]: num }));
        });
        rangeEl.addEventListener('change', handler);
    }

    checkShuffle.addEventListener('change', async () => {
        await save({ carouselShuffle: checkShuffle.checked });
        await controllers.refreshImages();
    });

    checkPaused.addEventListener('change', async () => {
        await save({ carouselPaused: checkPaused.checked });
    });

    checkPauseWhenHidden.addEventListener('change', async () => {
        await save({ pauseWhenHidden: checkPauseWhenHidden.checked });
    });

    function syncUi(settings) {
        inputImageSource.value = settings.imageSource;
        for (const [rangeId, valueId, key, fmt] of rangeIds) {
            setRangeValue(el(rangeId), el(valueId), settings[key], fmt);
        }
        checkShuffle.checked = settings.carouselShuffle;
        checkPaused.checked = settings.carouselPaused;
        checkPauseWhenHidden.checked = settings.pauseWhenHidden;
    }

    syncUi(currentSettings);
    refreshImported().catch(() => {
        importedCount.textContent = '0';
    });
}

async function loadSettings() {
    const saved = await storage.get();
    return normalizeSettings(saved);
}

async function buildImageItems(settings) {
    const imported = await listImportedImages();
    const importedItems = imported.map(x => ({ type: 'imported', id: x.id, name: x.name }));

    let packagedItems = [];
    try {
        const list = await loadPackagedImageList();
        packagedItems = list.map(name => ({ type: 'packaged', name }));
    } catch (_) {
        packagedItems = [];
    }

    const preferred = settings.imageSource === 'imported' ? importedItems : packagedItems;
    const fallback = settings.imageSource === 'imported' ? packagedItems : importedItems;
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
