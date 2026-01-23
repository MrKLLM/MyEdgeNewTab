# MYEDGENEWTAB V1.1.0

一个可自定义的 Microsoft Edge 新标签页，具有背景轮播和必应搜索功能（优化了图片切换时的白屏问题）。

**切换到英文版本：** [README.md](README.md)

## 与 V1.0.0 的主要区别

核心区别是**无需手动编辑图片文件名**——v1.1.0 使用批处理文件自动生成图片列表 JSON 文件，而 v1.0.0 需要手动将图片名输入核心文件。

## 功能特性

- **自动图片列表生成：** 批处理文件扫描 images 文件夹并生成 `image-list.json`（支持中文/带空格的文件名）
- **平滑背景轮播：** 预加载图片以消除切换时的白屏（1秒淡入淡出过渡效果）
- **必应搜索集成：** 功能完整的搜索框（支持回车键/按钮搜索）
- **可自定义 UI：** 调整轮播间隔、搜索框大小/样式、备用背景颜色
- **错误处理：** 图片/JSON 文件缺失时显示清晰警告，图片加载失败时有备用样式

## 支持环境

- Microsoft Edge（基于 Chromium） - [下载链接](https://www.microsoft.com/edge)
- Windows 操作系统（批处理文件仅适用于 Windows）
- Node.js（批处理文件运行 `generate-image-list.js` 所需） - [下载链接](https://nodejs.org/)
- Git（用于克隆/更新本地仓库） - [下载链接](https://git-scm.com/downloads)

> **注意：** 如果您计划使用自动生成图片列表功能或通过 Git 克隆仓库，请确保提前安装 Node.js 和 Git。

## 安装方法

### 选项 1：从发布版下载（推荐普通用户）

1. **v1.1.0 版本：** 从 [Release v1.1.0](https://github.com/YourUsername/MyEdgeNewTab/releases/tag/v1.1.0) 下载 `MyEdgeNewTab 1.1.0` 文件夹
2. **v1.0.0 版本：** 从 [Release v1.0.0](https://github.com/YourUsername/MyEdgeNewTab/releases/tag/v1.0.0) 下载 `MyEdgeNewTab 1.0.0` 文件夹
3. **加载到 Edge：** 打开 `edge://extensions/` → 启用开发者模式 → 点击"加载已解压的扩展程序" → 选择下载的文件夹

### 选项 2：克隆仓库到本地（适用于开发者/高级用户）

此方法允许您将本地文件与 GitHub 仓库的最新更新保持同步。

#### 步骤 1：将 GitHub 仓库克隆到本地

1. **安装 Git**：从 [https://git-scm.com/downloads](https://git-scm.com/downloads) 下载并安装 Git
2. **安装 Node.js**：从 [https://nodejs.org/](https://nodejs.org/) 下载并安装 Node.js（建议选择 LTS 版本）
3. 打开命令提示符/终端并导航到要存储项目的文件夹：

```bash
cd /path/to/your/target/folder
# 示例：cd C:\Users\YourName\Projects
```

4. 克隆仓库（替换为您的 GitHub 仓库 URL）：

```bash
git clone https://github.com/YourUsername/MyEdgeNewTab.git
```

5. 进入克隆的文件夹：

```bash
cd MyEdgeNewTab
```

#### 步骤 2：将本地仓库链接到 GitHub（如果您手动克隆）

如果您已有本地文件夹并想将其链接到 GitHub 仓库（而不是克隆）：

1. 初始化本地 Git 仓库（如果已初始化则跳过）：

```bash
git init
```

2. 链接到远程 GitHub 仓库：

```bash
git remote add origin https://github.com/YourUsername/MyEdgeNewTab.git
```

3. 从 GitHub 拉取最新代码（同步本地与远程）：

```bash
git pull origin main
```

#### 步骤 3：GitHub 更新后更新本地仓库

当 GitHub 仓库有新更新（例如 v1.2.0 发布、错误修复）时，同步您的本地文件：

1. 确保您在项目根文件夹中：

```bash
cd /path/to/MyEdgeNewTab
```

2. 从主分支拉取最新更改：

```bash
git pull origin main
```

3. （可选）切换到特定版本标签（例如 v1.1.0）：

```bash
git checkout v1.1.0
```

4. 切换回最新的主分支：

```bash
git checkout main
```

#### 步骤 4：加载到 Edge

1. 打开 Edge 并导航到 `edge://extensions/`
2. 启用开发者模式（右上角的切换开关）
3. 点击**加载已解压的扩展程序**并选择克隆的 `MyEdgeNewTab` 文件夹（或 `v1.1.0`/`v1.0.0` 子文件夹）
4. 打开新标签页——自定义页面将自动加载

## 使用方法（V1.1.0 核心流程）

### 准备图片

将您的图片（仅限 PNG/JPG/JPEG/WEBP 格式）放入 `MyEdgeNewTab 1.1.0` 目录下的 `images` 子文件夹中。

### 自动生成图片列表（关键步骤）

此步骤替代了手动文件名编辑（v1.0.0 工作流程）：

1. **确保 Node.js 已安装**：在命令提示符中输入 `node --version` 检查是否安装成功

2. 双击 `generate-image-list.bat`（仅限 Windows）

3. 将弹出一个 CMD 窗口，显示：
   
   ```
   ==============================
   生成图片列表...
   ==============================
   完成！按任意键关闭。
   ==============================
   ```

4. 批处理文件运行 `generate-image-list.js` 以创建/覆盖 `image-list.json`（根文件夹），包含所有有效的图片文件名

5. **如果跳过此步骤：** 将显示警告"扫描图片失败，请先双击 generate-image-list.bat 生成清单文件！"

### 使用自定义新标签页

- 新的 Edge 标签页将自动轮播您的图片
- 使用搜索框：输入查询 → 按 Enter 键或点击搜索按钮以运行必应搜索

## 自定义配置

### 调整轮播间隔

1. 使用文本编辑器（VS Code/Notepad++）打开 `script.js`

2. 找到：
   
   ```javascript
   const slideInterval = 4000; // 4000ms = 4s（默认值）
   ```

3. 修改该值（例如，5000 表示 5 秒，10000 表示 10 秒）→ 保存 → 刷新新标签页（Ctrl+R）

### 自定义搜索框

编辑 `styles.css` 以调整搜索框/按钮样式：

**搜索框属性**
| 属性 | 默认值 | 说明 |
|------|--------|------|
| width | 550px | 调整宽度 |
| height | 23px | 调整高度 |
| font-size | 16px | 文字大小 |
| border-radius | 24px | 圆角半径 |

**搜索按钮属性**
| 属性 | 默认值 | 说明 |
|------|--------|------|
| background-color | #4285f4 | 按钮颜色 |
| font-size | 14px | 文字大小 |
| border-radius | 4px | 圆角半径 |

**自定义示例：**

```css
/* 在 styles.css 中修改搜索框 */
#search-input {
  width: 600px;  /* 更宽 */
  height: 25px;
  border-radius: 30px;  /* 更圆润 */
}

/* 修改搜索按钮 */
#search-button {
  background-color: #28a745;  /* 绿色 */
  font-size: 15px;
}
```

## 重要注意事项

- **更新图片后：** 在 `images` 文件夹中添加/删除/替换图片 → 必须重新运行 `generate-image-list.bat` 以覆盖 `image-list.json`（旧列表不会自动更新）
- **图片格式：** 仅支持 PNG/JPG/JPEG/WEBP（批处理脚本会过滤其他格式）
- **批处理文件要求：** 必须安装 Node.js（才能运行 `generate-image-list.js`）
- **首次加载：** 图片在首次加载时会被缓存——后续切换无延迟
- **Git 同步注意事项：** 如果您修改了本地文件（例如自定义样式），运行 `git pull origin main` 将覆盖您的更改。同步前请备份修改后的文件

## 故障排除

| 问题                 | 解决方案                                                             |
| ------------------ | ---------------------------------------------------------------- |
| "扫描图片失败"警告         | 重新运行 `generate-image-list.bat` 以生成 `image-list.json`             |
| "images 文件夹内无图片"警告 | 向 `images` 文件夹添加有效图片 → 重新运行批处理文件                                 |
| 双击批处理文件无反应         | 检查是否安装了 Node.js，在命令提示符中运行 `node --version` 确认                    |
| 轮播时出现白屏            | 检查图片路径/文件名是否有误；确保图片格式有效（默认已启用预加载）                                |
| 搜索框无法使用            | 验证 `script.js` 是否完整（不要修改 search-input/search-button 的 ID）→ 刷新标签页 |
| 自定义样式不生效           | 刷新标签页（Ctrl+R）或在 `edge://extensions/` 中重新加载扩展                     |
| Git 拉取失败           | 确保没有未提交的本地更改；可先运行 `git stash` 临时保存更改，再拉取                         |

## 更新日志

### V1.1.0

- 新增 `generate-image-list.bat`/`generate-image-list.js` 以自动生成 `image-list.json`（无需手动编辑文件名）
- 实现图片预加载，解决轮播白屏问题
- 新增备用背景色（#f5f5f5），填充图片未覆盖的空白区域
- 改进错误处理，添加清晰的警告提示
- 优化轮播过渡逻辑（1秒淡入淡出）

### V1.0.0

- 基础背景轮播和必应搜索功能
- 需要手动将图片名编辑到核心文件中
