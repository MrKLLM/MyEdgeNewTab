# MYEDGENEWTAB

一个可自定义的 Microsoft Edge 新标签页，具有背景轮播和必应搜索功能（优化了图片切换时的白屏问题）。

**切换到英文版本：** [README.md](README.md)

## 版本核心区别

- **v1.1.x（当前版本）**：使用批处理文件自动生成 `image-list.json` — 无需手动编辑。

- **v1.0.0（旧版）**：需要手动在核心文件中编辑图片文件名。

## 功能特性

- **自动图片列表生成：** 批处理文件扫描 images 文件夹并生成 `image-list.json`（支持中文/带空格的文件名）

- **增强的文件名兼容性：** 支持带空格和编码 `%20` 字符的文件名

- **平滑背景轮播：** 预加载图片以消除切换时的白屏（1秒淡入淡出过渡效果）

- **必应搜索集成：** 功能完整的搜索框（支持回车键/按钮搜索）

- **可自定义 UI：** 调整轮播间隔、搜索框大小/样式、备用背景颜色

- **错误处理：** 图片/JSON 文件缺失时显示清晰警告，图片加载失败时有备用样式

## 支持环境

- Microsoft Edge（基于 Chromium） - [下载链接](https://www.microsoft.com/edge)

- Windows 操作系统（批处理文件仅适用于 Windows）

- Node.js（批处理文件运行 `generate-image-list.js` 所需） - [下载链接](https://nodejs.org/)

- Git（用于克隆/更新本地仓库） - [下载链接](https://git-scm.com/downloads)

> **注意：** 如果您计划使用自动生成图片列表功能或通过 Git 克隆仓库，请确保提前安装 Node.js 和 Git。

## 安装方法

### 选项 1：从发布版下载（推荐普通用户）

1. 从 [发布页面](https://github.com/YourUsername/MyEdgeNewTab/releases) 下载最新版本文件夹

2. **加载到 Edge：** 打开 `edge://extensions/` → 启用开发者模式 → 点击"加载已解压的扩展程序" → 选择下载的文件夹

### 选项 2：克隆仓库到本地（适用于开发者/高级用户）

bash

git clone https://github.com/YourUsername/MyEdgeNewTab.git
cd MyEdgeNewTab

然后通过 `edge://extensions/` 加载文件夹（需启用开发者模式）。

## 使用方法

### 准备图片

将您的图片（仅限 PNG/JPG/JPEG/WEBP 格式）放入 `images` 子文件夹中。

### 自动生成图片列表

1. 确保 Node.js 已安装（运行 `node --version` 检查）

2. 双击 `generate-image-list.bat`（仅限 Windows）

3. 脚本将生成/覆盖 `image-list.json`，包含所有有效图片文件名

### 使用自定义新标签页

- 新的 Edge 标签页将自动轮播您的图片

- 使用搜索框：输入查询 → 按 Enter 键或点击搜索按钮以运行必应搜索

## 自定义配置

### 调整轮播间隔

编辑 `script.js` 并修改：

javascript

const slideInterval = 4000; // 修改为所需的毫秒数

### 自定义搜索框

编辑 `styles.css` 以调整搜索框/按钮样式：

css

#search-input {
  width: 600px;
  border-radius: 30px;
}

#search-button {
  background-color: #28a745;
  font-size: 15px;
}

## 重要注意事项

- **更新图片后：** 在 `images` 文件夹中添加/删除/替换图片 → 必须重新运行 `generate-image-list.bat`

- **图片格式：** 仅支持 PNG/JPG/JPEG/WEBP

- **批处理文件要求：** 必须安装 Node.js

- **首次加载：** 图片在首次加载时会被缓存——后续切换无延迟

- **Git 同步注意事项：** 如果您修改了本地文件，运行 `git pull` 前请备份

## 故障排除

| 问题                 | 解决方案                                                             |
| ------------------ | ---------------------------------------------------------------- |
| "扫描图片失败"警告         | 重新运行 `generate-image-list.bat` 以生成 `image-list.json`             |
| "images 文件夹内无图片"警告 | 向 `images` 文件夹添加有效图片 → 重新运行批处理文件                                 |
| 双击批处理文件无反应         | 检查是否安装了 Node.js，在命令提示符中运行 `node --version` 确认                    |
| 轮播时出现白屏            | 检查图片路径/文件名是否有误；确保图片格式有效（默认已启用预加载）                                |
| 搜索框无法使用            | 验证 `script.js` 是否完整（不要修改 search-input/search-button 的 ID）→ 刷新标签页 |

## 更新日志

### V1.1.1

- 增强文件名兼容性：支持带空格和编码 `%20` 字符的文件名

- 新增 `getCorrectImagePath` 函数，统一处理路径规则

- 保留 v1.1.0 所有核心功能

- 补充全量代码注释，便于维护

### V1.1.0

- 新增 `generate-image-list.bat`/`generate-image-list.js` 以自动生成 `image-list.json`

- 实现图片预加载，解决轮播白屏问题

- 新增备用背景色（#f5f5f5）

- 改进错误处理，添加清晰的警告提示

- 优化轮播过渡逻辑（1秒淡入淡出）

### V1.0.0

- 基础背景轮播和必应搜索功能

- 需要手动将图片名编辑到核心文件中
