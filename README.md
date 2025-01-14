# 中国象棋 - 双人对弈

一个基于 HTML5 Canvas 的在线中国象棋游戏，支持双人对弈。

## 在线演示

- [GitHub Pages Demo](https://[用户名].github.io/chinese-chess/)
- [Cloudflare Pages Demo](https://[项目名].pages.dev)

![游戏预览](screenshots/preview.png)

## 功能特点

- 完整的中国象棋规则实现
- 响应式设计，适配不同屏幕尺寸
- 支持触摸设备操作
- 清晰的界面设计
  - 高清棋子和棋盘渲染
  - 走子轨迹显示
  - 可移动位置提示
- 走子提示功能
- 上一步棋路提示
- 将军提示
- 音效反馈
- 悔棋功能
- 新游戏功能
- 无需安装，打开浏览器即可游玩

## 技术栈

- HTML5 Canvas
- JavaScript (ES6+)
- CSS3
- 原生开发，无需任何框架
- 触摸事件支持

## 本地开发

1. 克隆仓库
    ```bash
    git clone https://github.com/[用户名]/chinese-chess.git
    cd chinese-chess
    ```

2. 启动本地服务器（任选其一）：
    ```bash
    # 使用 Python
    python -m http.server 8000

    # 或使用 Node.js
    npx http-server

    # 或使用 PHP
    php -S localhost:8000
    ```

3. 访问 `http://localhost:8000`

## 游戏规则

- 红方先手
- 遵循标准中国象棋规则
- 支持特殊规则：
  - 将帅不能照面
  - 将军检查
  - 将死判定
- 完整的胜负判定：
  - 将死判定
  - 将帅照面判定
  - 吃将判定

## 操作说明

### 桌面设备

1. 点击棋子选中
2. 绿色圆点显示可移动位置
3. 点击目标位置移动棋子
4. 棋子移动后会显示移动路径
5. 点击"悔棋"按钮可以撤销上一步
6. 点击"新游戏"按钮开始新的对局

### 触摸设备

1. 触摸棋子选中
2. 绿色圆点显示可移动位置
3. 触摸目标位置移动棋子
4. 移动轨迹会跟随手指显示
5. 触摸按钮区域执行相应操作

### 触摸优化

- 放大棋盘区域，提升触摸精确度
- 优化触摸点识别算法
- 添加触摸反馈动画
- 支持手势操作（如滑动悔棋）

## 界面元素

- 顶部显示当前行动方
- 棋盘中央有楚河汉界
- 底部按钮区：
  - 新游戏
  - 悔棋
- 触摸设备优化：
  - 更大的按钮区域
  - 清晰的触摸反馈
  - 适配不同屏幕尺寸

## 音效系统

游戏包含以下音效：
- 移动音效
- 吃子音效
- 将军音效

## 部署说明

### GitHub Pages 部署

1. Fork 本仓库到你的 GitHub 账号
2. 在仓库设置中启用 GitHub Pages：
    - 进入仓库的 Settings 标签
    - 找到 Pages 选项
    - Source 选择 `main` 分支
    - 点击 Save
3. 访问 `https://[你的用户名].github.io/[仓库名]/`

### Cloudflare Pages 部署

1. 登录 Cloudflare Dashboard
2. 进入 Pages 服务，点击 "Create a project"
3. 选择你的仓库并点击 "Begin setup"
4. 配置构建设置：
    - Framework preset: None
    - Build command: 留空
    - Build output directory: 留空
5. 点击 "Save and Deploy"
6. 访问 `https://[项目名].pages.dev`

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

MIT License

