const fs = require('fs');
const path = require('path');

// 读取images文件夹并生成清单（无任何日志输出）
const imagesDir = path.join(__dirname, 'images');
fs.readdir(imagesDir, (err, files) => {
    if (err) return;
    // 过滤图片格式
    const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
    });
    // 生成清单文件
    if (imageFiles.length > 0) {
        fs.writeFileSync('image-list.json', JSON.stringify(imageFiles, null, 2));
    }
});