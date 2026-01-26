// --- 【可选改】：轮播间隔（毫秒，1000=1秒） ---
const slideInterval = 4000;

// 存储图片清单的数组
let backgroundImages = [];
// 获取所有背景图层（用于轮播切换）
const layers = document.querySelectorAll('.background-layer');
// 搜索输入框和按钮DOM元素
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// ========== 核心：差异化处理文件名（兼容空格/%20字符） ==========
/**
 * 生成正确的图片路径（核心兼容逻辑）
 * 逻辑说明：
 * 1. 文件名含%20 → 二次编码%20为%2520（避免浏览器解析成空格）
 * 2. 文件名含空格 → 编码空格为%20（解决空格识别问题）
 * 3. 普通文件名 → 直接拼接
 * @param {string} imgName 原始图片文件名（如abc%20123.jpg / abc 123.jpg）
 * @returns {string} 带url()的完整背景图路径（加双引号防解析异常）
 */
function getCorrectImagePath(imgName) {
    let processedPath;
    // 场景1：文件名包含真实%20字符（如abc%20123.jpg）
    if (imgName.includes('%20')) {
        // 把%20二次编码为%2520，浏览器解码后还原为%20
        processedPath = `images/${imgName.replace(/%20/g, '%2520')}`;
    }
    // 场景2：文件名包含真实空格（如abc 123.jpg）
    else if (imgName.includes(' ')) {
        // 把空格编码为%20，浏览器解码后还原为空格
        processedPath = `images/${imgName.replace(/ /g, '%20')}`;
    }
    // 场景3：普通文件名（无空格/%20）
    else {
        processedPath = `images/${imgName}`;
    }
    // 给url加双引号，强制浏览器按处理后的路径解析，避免特殊字符异常
    return `url("${processedPath}")`;
}

// ========== 核心：读取预生成的图片清单（适配Edge新标签页） ==========
async function loadImageList() {
    try {
        // 在 chrome://newtab/ 上下文中，直接用相对路径请求图片清单
        const response = await fetch('image-list.json');
        // 检查请求是否成功（非200状态码则抛出错误）
        if (!response.ok) throw new Error('未找到图片清单文件');

        // 解析JSON为图片名数组
        backgroundImages = await response.json();
        // 检查是否有图片
        if (backgroundImages.length === 0) {
            alert('images文件夹内无图片！请放入png/jpg/jpeg/webp格式的图片');
            return false;
        }
        // 控制台打印加载结果，方便调试
        console.log('成功加载图片清单：', backgroundImages);

        // 预加载所有图片，确保切换时从缓存读取（避免白屏）
        preloadAllImages();
        return true;
    } catch (err) {
        // 捕获加载失败异常，打印并提示用户
        console.error('加载图片清单失败：', err);
        alert('扫描图片失败，请先双击「generate-image-list.bat」生成清单文件！');
        return false;
    }
}

// ========== 核心优化1：预加载所有图片（兼容空格/%20字符） ==========
function preloadAllImages() {
    // 遍历所有图片名，逐个预加载
    backgroundImages.forEach(imgName => {
        const img = new Image();
        let preloadSrc; // 预加载用的图片路径

        // 按文件名类型差异化处理路径（和getCorrectImagePath逻辑同步）
        if (imgName.includes('%20')) {
            preloadSrc = `images/${imgName.replace(/%20/g, '%2520')}`;
        } else if (imgName.includes(' ')) {
            preloadSrc = `images/${imgName.replace(/ /g, '%20')}`;
        } else {
            preloadSrc = `images/${imgName}`;
        }

        // 设置图片src触发预加载，浏览器会缓存图片，后续使用直接读取
        img.src = preloadSrc;
        // 预加载完成后无操作，仅利用浏览器缓存机制
    });
}

// ========== 原有轮播逻辑（核心修改：兼容空格/%20字符） ==========
function initLayers() {
    // 初始化第一个图层的背景图（用差异化路径处理函数）
    layers[0].style.backgroundImage = getCorrectImagePath(backgroundImages[currentSlide]);
    // 主动添加active类，确保初始有激活的图层（避免页面空白）
    layers[0].classList.add('active');

    // 预加载第二个图层的图片，避免首次切换白屏
    const nextIndex = (currentSlide + 1) % backgroundImages.length;
    const nextImg = new Image();
    let nextPreloadSrc; // 第二个图层预加载路径

    // 按文件名类型处理预加载路径
    if (backgroundImages[nextIndex].includes('%20')) {
        nextPreloadSrc = `images/${backgroundImages[nextIndex].replace(/%20/g, '%2520')}`;
    } else if (backgroundImages[nextIndex].includes(' ')) {
        nextPreloadSrc = `images/${backgroundImages[nextIndex].replace(/ /g, '%20')}`;
    } else {
        nextPreloadSrc = `images/${backgroundImages[nextIndex]}`;
    }

    // 设置预加载路径
    nextImg.src = nextPreloadSrc;
    // 预加载完成后，给第二个图层赋值背景图
    nextImg.onload = () => {
        layers[1].style.backgroundImage = getCorrectImagePath(backgroundImages[nextIndex]);
    };
}

// ========== 核心优化2：重写showNextSlide函数（先加载图片再切换） ==========
function showNextSlide() {
    // 获取当前激活的图层和未激活的图层
    const activeLayer = document.querySelector('.background-layer.active');
    const inactiveLayer = document.querySelector('.background-layer:not(.active)');

    // 计算下一张图片的索引（循环轮播）
    const nextSlideIndex = (currentSlide + 1) % backgroundImages.length;
    const imgName = backgroundImages[nextSlideIndex];

    // 处理下一张图片的预加载路径（和预加载逻辑同步）
    let nextImagePath;
    if (imgName.includes('%20')) {
        nextImagePath = `images/${imgName.replace(/%20/g, '%2520')}`;
    } else if (imgName.includes(' ')) {
        nextImagePath = `images/${imgName.replace(/ /g, '%20')}`;
    } else {
        nextImagePath = `images/${imgName}`;
    }

    // 1. 先创建图片对象，确认图片加载完成（缓存命中也会触发onload）
    const img = new Image();
    img.src = nextImagePath;

    // 图片加载成功后的逻辑
    img.onload = () => {
        // 2. 图片加载完成后，给非活跃图层赋值背景图（用差异化路径函数）
        inactiveLayer.style.backgroundImage = getCorrectImagePath(imgName);

        // 3. 微小延迟（50ms），让浏览器完成图片渲染，再切换图层（避免白屏）
        setTimeout(() => {
            // 切换图层的active状态（显示新图层，隐藏旧图层）
            activeLayer.classList.remove('active');
            inactiveLayer.classList.add('active');
            // 更新当前显示的图片索引
            currentSlide = nextSlideIndex;

            // 4. 提前预加载下下次要显示的图片，进一步避免白屏
            const nextNextIndex = (currentSlide + 1) % backgroundImages.length;
            const nextNextImg = new Image();
            let nextNextSrc;

            // 处理下下次图片的预加载路径
            if (backgroundImages[nextNextIndex].includes('%20')) {
                nextNextSrc = `images/${backgroundImages[nextNextIndex].replace(/%20/g, '%2520')}`;
            } else if (backgroundImages[nextNextIndex].includes(' ')) {
                nextNextSrc = `images/${backgroundImages[nextNextIndex].replace(/ /g, '%20')}`;
            } else {
                nextNextSrc = `images/${backgroundImages[nextNextIndex]}`;
            }

            nextNextImg.src = nextNextSrc;
        }, 50);
    };

    // 兜底：图片加载失败时的处理（避免白屏）
    img.onerror = () => {
        // 打印失败路径，方便调试
        console.error(`图片加载失败：${nextImagePath}`);
        // 加载失败时设为无背景（可替换为兜底图片）
        inactiveLayer.style.backgroundImage = 'none';
        setTimeout(() => {
            // 仍切换图层，保证轮播逻辑不中断
            activeLayer.classList.remove('active');
            inactiveLayer.classList.add('active');
            currentSlide = nextSlideIndex;
        }, 50);
    };
}

// ========== 初始化流程 ==========
let currentSlide = 0; // 当前显示的图片索引
(async () => {
    // 1. 加载图片清单（异步等待加载完成）
    const isSuccess = await loadImageList();
    // 加载失败则终止初始化
    if (!isSuccess) return;

    // 2. 随机起始索引（每次刷新页面显示不同的起始图片）
    currentSlide = Math.floor(Math.random() * backgroundImages.length);

    // 3. 初始化图层 + 启动轮播
    initLayers();
    // 新增：轮播启动前确保初始化完成，避免首次切换异常（100ms延迟）
    setTimeout(() => {
        setInterval(showNextSlide, slideInterval);
    }, 100);
})();

// ========== 原有搜索功能（无需修改） ==========
/**
 * 执行搜索功能
 * 逻辑：获取输入框内容，拼接Bing搜索URL，在当前页面打开
 */
function performSearch() {
    // 获取并去除输入框内容的首尾空格
    const query = searchInput.value.trim();
    // 有搜索内容才执行搜索
    if (query) {
        // 编码搜索关键词，拼接Bing搜索URL
        const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
        // 在当前窗口打开搜索页面
        window.open(searchUrl, '_self');
    }
}

// 绑定搜索按钮点击事件
searchButton.addEventListener('click', performSearch);
// 绑定输入框回车事件（按Enter触发搜索）
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});