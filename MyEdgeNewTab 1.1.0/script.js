// --- 【可选改】：轮播间隔（毫秒，1000=1秒） ---
const slideInterval = 4000;

let backgroundImages = [];
const layers = document.querySelectorAll('.background-layer');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// ========== 核心：读取预生成的图片清单（适配Edge新标签页） ==========
async function loadImageList() {
    try {
        // 在 chrome://newtab/ 上下文中，直接用相对路径即可
        const response = await fetch('image-list.json');
        if (!response.ok) throw new Error('未找到图片清单文件');

        backgroundImages = await response.json();
        if (backgroundImages.length === 0) {
            alert('images文件夹内无图片！请放入png/jpg/jpeg/webp格式的图片');
            return false;
        }
        console.log('成功加载图片清单：', backgroundImages);

        // 新增：预加载所有图片，确保切换时从缓存读取
        preloadAllImages();
        return true;
    } catch (err) {
        console.error('加载图片清单失败：', err);
        alert('扫描图片失败，请先双击「generate-image-list.bat」生成清单文件！');
        return false;
    }
}

// ========== 新增：预加载所有图片（核心优化1） ==========
function preloadAllImages() {
    backgroundImages.forEach(imgName => {
        const img = new Image();
        // 对文件名做URL编码，处理空格
        img.src = encodeURI(`images/${imgName}`);  // Edge新标签页相对路径
        // 预加载完成后无操作，仅让浏览器缓存图片
    });
}

// ========== 原有轮播逻辑（核心修改：解决白屏问题） ==========
function initLayers() {
    // 初始化第一个图层
    layers[0].style.backgroundImage = `url(images/${backgroundImages[currentSlide]})`;
    layers[0].classList.add('active'); // 主动添加active类，确保初始有激活图层

    // 预加载第二个图层的图片，避免首次切换白屏
    const nextIndex = (currentSlide + 1) % backgroundImages.length;
    const nextImg = new Image();
    nextImg.src = encodeURI(`images/${backgroundImages[nextIndex]}`);
    nextImg.onload = () => {
        layers[1].style.backgroundImage = `url(images/${backgroundImages[nextIndex]})`;
    };
}

// 重写showNextSlide函数（核心优化2：先加载图片再切换）
function showNextSlide() {
    const activeLayer = document.querySelector('.background-layer.active');
    const inactiveLayer = document.querySelector('.background-layer:not(.active)');

    // 计算下一张图片索引
    const nextSlideIndex = (currentSlide + 1) % backgroundImages.length;
    const nextImageUrl = `images/${backgroundImages[nextSlideIndex]}`;

    // 1. 先创建图片对象，确认图片加载完成（缓存命中也会触发onload）
    const img = new Image();
    img.src = nextImageUrl;

    img.onload = () => {
        // 2. 图片加载完成后，赋值给非活跃图层
        inactiveLayer.style.backgroundImage = `url(${encodeURI(nextImageUrl)})`;

        // 3. 微小延迟（50ms），让浏览器完成图片渲染，再切换图层
        setTimeout(() => {
            activeLayer.classList.remove('active');
            inactiveLayer.classList.add('active');
            // 更新当前索引
            currentSlide = nextSlideIndex;

            // 4. 提前预加载下下次要显示的图片，进一步避免白屏
            const nextNextIndex = (currentSlide + 1) % backgroundImages.length;
            const nextNextImg = new Image();
            nextNextImg.src = `images/${backgroundImages[nextNextIndex]}`;
        }, 50);
    };

    // 兜底：图片加载失败时的处理（避免白屏）
    img.onerror = () => {
        console.error(`图片加载失败：${nextImageUrl}`);
        inactiveLayer.style.backgroundImage = 'none'; // 用兜底色替代
        setTimeout(() => {
            activeLayer.classList.remove('active');
            inactiveLayer.classList.add('active');
            currentSlide = nextSlideIndex;
        }, 50);
    };
}

// ========== 初始化流程 ==========
let currentSlide = 0;
(async () => {
    // 1. 加载图片清单
    const isSuccess = await loadImageList();
    if (!isSuccess) return;

    // 2. 随机起始索引
    currentSlide = Math.floor(Math.random() * backgroundImages.length);

    // 3. 初始化图层 + 启动轮播
    initLayers();
    // 新增：轮播启动前确保初始化完成，避免首次切换异常
    setTimeout(() => {
        setInterval(showNextSlide, slideInterval);
    }, 100);
})();

// ========== 原有搜索功能（无需修改） ==========
function performSearch() {
    const query = searchInput.value.trim();
    if (query) {
        const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
        window.open(searchUrl, '_self');
    }
}

searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});