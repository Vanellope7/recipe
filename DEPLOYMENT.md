# 食谱小管家 - 部署指南

这是一个为你和对象设计的专属食谱应用，可以部署到 Cloudflare Pages 并安装为手机 APP。

## 功能特点

- 查看和管理食谱列表
- 上传新食谱（名称 + 图片）
- 给食谱打分（1-5星）
- 收藏想吃的食谱
- PWA 支持，可安装为手机应用

## 部署步骤

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 创建 D1 数据库

```bash
# 创建数据库
wrangler d1 create recipe_db

# 记下返回的 database_id，更新 wrangler.toml 中的 database_id
```

### 4. 初始化数据库

```bash
# 本地开发时初始化数据库
wrangler d1 execute recipe-db --local --file=./server/schema.sql

# 生产环境初始化
wrangler d1 execute recipe-db --file=./server/schema.sql
```

### 5. 生成应用图标

你需要生成 192x192 和 512x512 两个尺寸的 PNG 图标：

**方法 1：使用在线工具**
1. 访问 https://realfavicongenerator.net/
2. 上传 `public/icon.svg`
3. 下载并重命名为：
   - `icon-192.png` (192x192)
   - `icon-512.png` (512x512)
4. 放到 `public/` 目录

**方法 2：使用命令行工具**
```bash
# 安装 ImageMagick
# macOS: brew install imagemagick
# Windows: 从 https://imagemagick.org 下载安装

# 生成图标
magick public/icon.svg -resize 192x192 public/icon-192.png
magick public/icon.svg -resize 512x512 public/icon-512.png
```

### 6. 本地开发测试

```bash
# 进入项目目录
cd recipe-app

# 安装依赖
npm install

# 启动开发服务器（需要连接 Cloudflare D1）
npm run dev
```

### 7. 部署到 Cloudflare

**选项 A：使用 Cloudflare Pages（推荐）**

1. 将代码推送到 GitHub
2. 在 Cloudflare 控制台创建新的 Pages 项目
3. 连接你的 GitHub 仓库
4. 配置构建设置：
   - 构建命令: `npm run build`
   - 输出目录: `.output/public`
5. 在环境变量中添加：
   - `CLOUDFLARE_D1_DATABASE_ID`: 你的 D1 数据库 ID

**选项 B：使用 Wrangler 直接部署**

```bash
# 构建
npm run build

# 部署
wrangler pages deploy .output/public
```

### 8. 配置 D1 数据库绑定（Cloudflare Pages）

1. 进入 Cloudflare 控制台
2. 选择你的 Pages 项目
3. 进入 "Settings" -> "Functions"
4. 在 "D1 database bindings" 中：
   - Variable name: `DB`
   - D1 database: 选择你创建的 `recipe_db`

### 9. 安装为 APP

部署完成后：

1. 在手机浏览器访问你的应用 URL
2. iOS Safari: 点击分享按钮 -> "添加到主屏幕"
3. Android Chrome: 点击菜单 -> "安装应用" 或 "添加到主屏幕"

## 图片存储方案

### 方案 1：使用 Cloudflare Images（推荐）

1. 在 Cloudflare 控制台启用 Images
2. 使用 Cloudflare API 上传图片
3. 将返回的 URL 保存到数据库

### 方案 2：使用 Cloudflare R2

1. 创建 R2 存储桶
2. 使用 wrangler 上传图片
3. 通过公开访问 URL 引用

### 方案 3：使用外部图床（简单）

你可以使用任何公开的图片 URL：
- Imgur
- Cloudinary
- 自建的图床服务
- 任何可访问的 HTTPS 图片 URL

## 使用说明

1. **添加食谱**：点击右上角 "+ 添加食谱" 按钮
2. **查看食谱**：首页展示所有食谱卡片
3. **打分**：点击食谱卡片上的 "打分" 按钮
4. **收藏**：点击图片右上角的心形按钮
5. **删除**：点击 "删除" 按钮移除食谱

## 数据库结构

```sql
recipes (食谱表)
  - id: 主键
  - name: 食谱名称
  - image_url: 图片 URL
  - created_at: 创建时间
  - updated_at: 更新时间

ratings (评分表)
  - id: 主键
  - recipe_id: 关联的食谱 ID
  - score: 评分 (1-5)
  - rated_at: 评分时间

favorites (收藏表)
  - id: 主键
  - recipe_id: 关联的食谱 ID
  - favorited_at: 收藏时间
```

## 成本估算

Cloudflare 免费套餐足够个人使用：

- **Pages**: 免费（无限请求，500 构建月）
- **D1**: 免费（5GB 存储，2500 万行读取月）
- **Images**: 免费（基础套餐）
- **总成本**: $0/月

## 技术栈

- **前端**: Vue 3 + Nuxt 4
- **后端**: Cloudflare Workers
- **数据库**: Cloudflare D1 (SQLite)
- **图片**: Cloudflare Images
- **PWA**: @nuxtjs/pwa

## 常见问题

**Q: 如何备份数据？**
A: 使用 `wrangler d1 export recipe-db --output=backup.sql`

**Q: 如何修改主题颜色？**
A: 编辑 `nuxt.config.ts` 中的 `theme_color` 值

**Q: 能添加用户认证吗？**
A: 可以使用 Cloudflare Access 或添加简单的密码验证

**Q: 如何支持多用户？**
A: 需要添加用户表和认证系统，目前版本是单用户设计

## 更新应用

修改代码后：

```bash
# 本地测试
npm run dev

# 构建并部署
npm run build
wrangler pages deploy .output/public
```

## 许可证

MIT License - 可自由使用和修改
