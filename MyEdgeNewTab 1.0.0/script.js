// --- 【必须改】：替换成你images文件夹里的图片名 ---
const backgroundImages = [
    "sikula_4.png",   // 改成你的图片1
    "keliaopeitela_2.png",
    "login 53.png",   // 改成你的图片2
    "aila_2.png",
    "balaka_2.png",
    "nina_2.png",
    "miaofeng_2.png",
    "dikaina_2.png",
    "yanzhan_4.png"
    // 想加更多图？就在这里加逗号，再写新图片名
];

// --- 【可选改】：轮播间隔（毫秒，1000=1秒） ---
const slideInterval = 4000; // 现在是4秒切换一次


// --- 下面的代码修改：操作双图层实现淡入淡出 ---
const layers = document.querySelectorAll('.background-layer'); // 获取两个背景图层
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// 【核心修改】：不再固定从索引 0 开始，而是随机生成一个起始索引
// let currentSlide = 0; // 这是原来的代码
let currentSlide = Math.floor(Math.random() * backgroundImages.length); // 这是修改后的代码

// 初始化：给两个图层设置初始背景图（提前加载，避免切换空白）
function initLayers() {
    // 图层1：设置“当前索引”的背景图
    layers[0].style.backgroundImage = `url('images/${backgroundImages[currentSlide]}')`;
    // 图层2：设置“下一个索引”的背景图（提前加载）
    const nextIndex = (currentSlide + 1) % backgroundImages.length;
    layers[1].style.backgroundImage = `url('images/${backgroundImages[nextIndex]}')`;
}

function showNextSlide() {
    // 找到“当前激活”和“未激活”的图层
    const activeLayer = document.querySelector('.background-layer.active');
    const inactiveLayer = document.querySelector('.background-layer:not(.active)');

    // 更新“未激活图层”的背景图为“下一张”
    currentSlide = (currentSlide + 1) % backgroundImages.length;
    inactiveLayer.style.backgroundImage = `url('images/${backgroundImages[currentSlide]}')`;

    // 切换 active 类 → 触发 opacity 过渡（淡入淡出）
    activeLayer.classList.remove('active');
    inactiveLayer.classList.add('active');
}

// 初始化图层 + 启动轮播
initLayers(); // 先初始化两个图层的背景图
showNextSlide(); // 显示第一张图（切换后触发淡入）
setInterval(showNextSlide, slideInterval); // 启动自动轮播

// 搜索功能（无修改）
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