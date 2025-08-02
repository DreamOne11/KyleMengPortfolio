# Photography Screen & My Note Screen 开发计划

## 📋 项目概述

本文档用于追踪 Kyle Meng Portfolio 项目中 Photography Screen 和 My Note Screen 两个核心功能的开发进度。

### 开发目标
- 完善 Photography Screen 的照片展示功能（使用 PostgreSQL 数据库存储）
- 实现 My Note Screen 的技术笔记管理系统
- 构建 Spring Boot 后端 API 支持数据持久化
- 确保桌面端和移动端的响应式体验
- 保持与现有 macOS 风格设计的一致性

### 技术架构
- **前端**: React + TypeScript + Tailwind CSS
- **后端**: Spring Boot 3.5.0 + PostgreSQL 
- **数据存储**: PostgreSQL 数据库
- **API**: RESTful API 设计
- **部署**: 前后端分离架构

---

## 📸 Photography Screen 开发清单

### Phase 0: 后端基础架构 (预估: 3-4小时)
- [ ] 配置 PostgreSQL 数据库和 Spring Boot 依赖
  - [ ] 添加 Spring Data JPA 依赖
  - [ ] 添加 PostgreSQL Driver 依赖
  - [ ] 配置 application.properties 数据库连接
- [ ] 创建数据库实体类
  - [ ] PhotoCategory 实体类设计
  - [ ] Photo 实体类设计
  - [ ] 实体关系映射 (One-to-Many)
- [ ] 设计数据库表结构
  - [ ] photo_categories 表结构
  - [ ] photos 表结构和外键关系
- [ ] 实现 Repository 和 Service 层
  - [ ] PhotoCategoryRepository 接口
  - [ ] PhotoRepository 接口
  - [ ] PhotoService 业务逻辑层
- [ ] 创建 REST API Controller
  - [ ] GET /api/photo-categories 接口
  - [ ] GET /api/photos/category/{categoryId} 接口
  - [ ] GET /api/photos/{id} 接口
- [ ] 添加初始化数据脚本
  - [ ] 创建 4 个默认摄影分类
  - [ ] 添加示例照片数据

### Phase 1: 前端基础结构 (预估: 4-6小时)
- [ ] 创建前端 TypeScript 类型定义
  - [ ] PhotoCategory 接口定义
  - [ ] Photo 接口定义
  - [ ] API 响应类型定义
- [ ] 实现 API 服务层
  - [ ] 创建 photographyApi.ts 文件
  - [ ] 配置 Axios HTTP 客户端
  - [ ] 实现获取分类列表 API 调用
  - [ ] 添加统一错误处理机制
- [ ] 从数据库动态获取摄影分类文件夹
  - [ ] Nature Photography 文件夹 (从 API 获取)
  - [ ] Street Photography 文件夹 (从 API 获取)
  - [ ] Portrait Photography 文件夹 (从 API 获取)
  - [ ] Travel Photography 文件夹 (从 API 获取)
- [ ] 设计文件夹图标和样式 (基于数据库配置)
  - [ ] 动态图标颜色方案
  - [ ] 文件夹计数显示
- [ ] 实现文件夹布局 (桌面端 + 移动端)
- [ ] 添加文件夹交互逻辑 (单击选中, 双击打开)
- [ ] 前后端集成测试和调试

### Phase 2: 照片管理系统 (预估: 6-8小时)  
- [ ] 扩展 FileManager 组件支持数据库图片文件
- [ ] 实现从数据库获取照片列表 API
  - [ ] 按分类获取照片列表
  - [ ] 照片详情获取接口
  - [ ] 分页和排序支持
- [ ] 实现照片缩略图展示
  - [ ] 图片路径动态加载
  - [ ] 缩略图懒加载优化
- [ ] 添加照片元数据显示 (从数据库获取)
  - [ ] 拍摄时间显示
  - [ ] 地点信息显示
  - [ ] 相机信息显示
  - [ ] EXIF 数据展示
- [ ] 实现响应式照片网格布局
- [ ] 添加图片上传和管理功能 (可选扩展)

### Phase 3: 照片查看器 (预估: 4-6小时)
- [ ] 创建全屏照片查看器组件
- [ ] 实现图片懒加载和预加载
- [ ] 添加左右导航功能
- [ ] 支持移动端触摸滑动
- [ ] 添加照片信息覆盖层

### Phase 4: 性能优化 (预估: 2-3小时)
- [ ] 图片压缩和多尺寸支持
- [ ] 虚拟滚动优化 (如需要)
- [ ] 加载状态和错误处理
- [ ] 移动端性能测试和优化

---

## 📝 My Note Screen 开发清单

### Phase 0: 后端数据架构 (预估: 2-3小时)
- [ ] 创建笔记相关实体类
  - [ ] NoteCategory 实体类设计
  - [ ] Note 实体类设计
  - [ ] 实体关系映射
- [ ] 设计笔记数据库表结构
  - [ ] note_categories 表结构
  - [ ] notes 表结构和关系
- [ ] 实现笔记相关 REST API
  - [ ] GET /api/note-categories 接口
  - [ ] GET /api/notes/category/{categoryId} 接口
  - [ ] GET /api/notes/{id} 接口
- [ ] 添加笔记初始化数据
  - [ ] 创建 6 个默认笔记分类
  - [ ] 添加示例笔记数据

### Phase 1: 前端文件夹结构 (预估: 3-4小时)
- [ ] 从数据库动态获取笔记分类系统
  - [ ] Frontend Development 文件夹 (从 API 获取)
  - [ ] Backend Development 文件夹 (从 API 获取)
  - [ ] Algorithm & Data Structure 文件夹 (从 API 获取)
  - [ ] System Design 文件夹 (从 API 获取)
  - [ ] Reading Notes 文件夹 (从 API 获取)
  - [ ] Project Insights 文件夹 (从 API 获取)
- [ ] 创建前端笔记 API 服务层
  - [ ] 创建 notesApi.ts 文件
  - [ ] 实现笔记相关 API 调用
- [ ] 创建文件夹图标和颜色方案
- [ ] 实现响应式文件夹布局

### Phase 2: 笔记数据管理 (预估: 4-5小时)
- [ ] 实现从数据库获取笔记数据
  - [ ] 按分类获取笔记列表 API 集成
  - [ ] 笔记详情获取 API 集成
  - [ ] 搜索和筛选 API 集成
- [ ] 创建示例笔记内容 (存储在数据库)
- [ ] 实现笔记列表展示
  - [ ] 笔记卡片组件设计
  - [ ] 列表分页功能
- [ ] 添加笔记元数据 (从数据库获取)
  - [ ] 标题、日期、标签显示
  - [ ] 笔记摘要生成
  - [ ] 阅读时间估算
- [ ] 实现文件类型图标显示
  - [ ] Markdown 文件图标
  - [ ] 代码片段图标
  - [ ] 图片附件图标

### Phase 3: 笔记查看器 (预估: 6-8小时)
- [ ] 创建笔记详情查看组件
- [ ] 集成 Markdown 渲染器
- [ ] 实现代码语法高亮
- [ ] 添加笔记内部导航
- [ ] 支持图片和链接展示

### Phase 4: 搜索和筛选 (预估: 4-5小时)
- [ ] 实现笔记搜索功能
- [ ] 添加标签筛选系统
- [ ] 实现按日期排序
- [ ] 添加全文搜索支持
- [ ] 创建搜索结果高亮

---

## 🎨 视觉增强开发清单

### 交互动画 (预估: 3-4小时)
- [ ] 文件夹 hover 效果动画
- [ ] 页面切换过渡动画
- [ ] 加载状态动画组件
- [ ] 图片懒加载动画效果

### 设计一致性 (预估: 2-3小时)
- [ ] 统一图标设计语言
- [ ] 颜色方案调整和优化
- [ ] 字体和排版一致性检查
- [ ] macOS 风格细节完善

---

## 📱 响应式开发清单

### 桌面端优化 (预估: 2-3小时)
- [ ] 大屏幕布局优化 (≥1440px)
- [ ] 鼠标交互体验完善
- [ ] 快捷键支持
- [ ] 右键菜单功能 (可选)

### 移动端优化 (预估: 4-5小时)
- [ ] 小屏幕布局适配 (<768px)
- [ ] 触摸交互优化
- [ ] 移动端导航改进
- [ ] 手势支持 (滑动、缩放)

### 平板端适配 (预估: 2-3小时)
- [ ] 中等屏幕布局 (768px-1024px)
- [ ] 混合交互模式
- [ ] 横竖屏切换适配

---

## 🛠️ 技术实施要点

### 后端架构设置
- [ ] 配置 Spring Boot + PostgreSQL 环境
  - [ ] Maven 依赖配置
  - [ ] 数据库连接配置
  - [ ] JPA 配置和实体映射
- [ ] 设计 RESTful API 规范
  - [ ] API 路径设计
  - [ ] 请求/响应格式定义
  - [ ] 错误处理规范
- [ ] 实现数据库实体和关系映射
  - [ ] 实体类注解配置
  - [ ] 表关系设计
  - [ ] 数据验证规则
- [ ] 添加数据验证和错误处理
  - [ ] 请求参数验证
  - [ ] 业务逻辑错误处理
  - [ ] HTTP 状态码规范
- [ ] 配置 CORS 和安全设置
  - [ ] 跨域请求配置
  - [ ] 基础安全配置
- [ ] 创建数据库初始化脚本
  - [ ] SQL 初始化脚本
  - [ ] 示例数据插入

### 前端 API 集成
- [ ] 创建 API 客户端服务层
  - [ ] Axios 配置和拦截器
  - [ ] API 基础 URL 配置
  - [ ] 请求/响应类型定义
- [ ] 实现统一的错误处理
  - [ ] 网络错误处理
  - [ ] 业务错误提示
  - [ ] 重试机制
- [ ] 添加 Loading 状态管理
  - [ ] 全局 Loading 状态
  - [ ] 组件级 Loading 状态
  - [ ] Skeleton 加载效果
- [ ] 配置开发环境代理
  - [ ] Webpack 代理配置
  - [ ] 开发/生产环境区分
- [ ] 实现数据缓存策略
  - [ ] API 响应缓存
  - [ ] 本地存储策略

### 资源准备
- [ ] 创建 `public/images/photography/` 目录结构
- [ ] 准备示例照片资源 (已优化)
- [ ] 准备笔记内容和 Markdown 文件

### 组件开发
- [ ] 扩展现有 FileManager 组件
- [ ] 创建 PhotoViewer 组件
- [ ] 创建 NoteViewer 组件  
- [ ] 创建 SearchBar 组件
- [ ] 创建 LoadingSpinner 组件

### 数据管理 (重大更新)
- [ ] 设计 PostgreSQL 照片表结构
  - [ ] photo_categories 表设计
  - [ ] photos 表设计和关系
  - [ ] 索引优化策略
- [ ] 设计 PostgreSQL 笔记表结构
  - [ ] note_categories 表设计
  - [ ] notes 表设计和关系
  - [ ] 全文搜索索引
- [ ] 实现数据库数据加载逻辑
  - [ ] JPA Repository 查询方法
  - [ ] 复杂查询和连接
  - [ ] 分页和排序实现
- [ ] 添加数据库连接错误处理机制
  - [ ] 连接池配置
  - [ ] 事务管理
  - [ ] 异常处理策略
- [ ] 实现数据同步和更新策略
  - [ ] 缓存失效机制
  - [ ] 数据一致性保证

---

## 🧪 测试计划

### 功能测试
- [ ] 后端 API 接口测试
  - [ ] 单元测试编写
  - [ ] API 集成测试
- [ ] 前端组件功能测试
  - [ ] 文件夹交互测试 (单击、双击)
  - [ ] 照片查看器功能测试
  - [ ] 笔记搜索功能测试
- [ ] 前后端集成测试
  - [ ] API 数据流测试
  - [ ] 错误处理测试
- [ ] 响应式布局测试

### 兼容性测试
- [ ] Chrome/Safari/Firefox 浏览器测试
- [ ] iOS Safari 移动端测试
- [ ] Android Chrome 移动端测试
- [ ] 平板设备测试

### 性能测试
- [ ] 数据库查询性能测试
  - [ ] 复杂查询优化
  - [ ] 索引效果验证
- [ ] 图片加载性能测试
- [ ] 大量笔记加载测试
- [ ] API 响应时间测试
- [ ] 移动端性能测试
- [ ] 内存使用优化验证

---

## 📊 进度追踪

### 整体进度
- **后端基础架构**: 0% (0/11 任务完成) - 新增
- **Photography Screen**: 0% (0/20 任务完成) - 增加3个任务
- **My Note Screen**: 0% (0/20 任务完成) - 增加4个任务
- **视觉增强**: 0% (0/6 任务完成)
- **响应式开发**: 0% (0/7 任务完成)
- **技术实施**: 0% (0/21 任务完成) - 增加12个任务
- **测试计划**: 0% (0/12 任务完成) - 增加4个任务

### 总体完成度
**0/97 任务完成 (0%)** (原63个 + 新增34个后端相关任务)

---

## 📅 里程碑计划

### Week 1: 基础架构 + 后端开发
- 完成后端 PostgreSQL 数据库设计和配置
- 完成 Photography 和 Notes 相关 REST API
- 完成 Photography Screen Phase 1 (前端基础结构)
- 完成 My Note Screen Phase 1 (前端文件夹结构)
- 前后端基础集成测试

### Week 2: 前后端集成 + 核心功能
- 完成前后端 API 集成和数据流
- 完成照片和笔记的数据展示 (Phase 2)
- 实现搜索和筛选功能
- 基础响应式适配
- 数据加载和错误处理完善

### Week 3: 高级功能 + 优化测试
- 完成照片查看器和笔记查看器 (Phase 3)
- 性能优化和视觉增强
- 全面测试和 bug 修复
- 移动端体验完善
- 数据库性能优化

---

## 📝 开发笔记

### 技术依赖

#### 后端依赖 (新增)
- Spring Boot 3.5.0 + Spring Data JPA
- PostgreSQL Driver
- Spring Boot Validation
- Spring Boot Web
- Jackson (JSON 处理)

#### 前端依赖
- React、TypeScript (现有技术栈)
- Axios (HTTP 客户端)
- React Query (可选，API 状态管理)
- Markdown 渲染库 (如 react-markdown)
- 代码高亮库 (如 prism.js)
- 图片懒加载库 (如 react-intersection-observer)

### 设计原则
1. 保持与现有 Contact 文件夹的交互一致性
2. 确保 macOS 文件系统的视觉风格
3. 优先考虑移动端用户体验
4. 性能优先，避免不必要的重渲染
5. **数据库优先，确保数据持久化和扩展性** (新增)
6. **API 设计遵循 RESTful 规范** (新增)
7. **前后端分离，便于独立开发和部署** (新增)

---

*最后更新: 2025-08-02*
*预估总工时: 60-80 小时* (原40-55小时 + 新增20-25小时后端开发)

---

## 🗄️ 数据库设计参考

### 摄影相关表结构
```sql
-- 摄影分类表
CREATE TABLE photo_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_color VARCHAR(20) DEFAULT '#3B82F6',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 照片表
CREATE TABLE photos (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT REFERENCES photo_categories(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_path VARCHAR(500) NOT NULL,
    thumbnail_path VARCHAR(500),
    metadata JSONB,
    taken_at TIMESTAMP,
    location VARCHAR(200),
    camera_info VARCHAR(200),
    file_size BIGINT,
    dimensions VARCHAR(20),
    sort_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 笔记相关表结构
```sql
-- 笔记分类表
CREATE TABLE note_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_color VARCHAR(20) DEFAULT '#10B981',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 笔记表
CREATE TABLE notes (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT REFERENCES note_categories(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    tags TEXT[], -- PostgreSQL 数组类型
    reading_time INTEGER, -- 估算阅读时间(分钟)
    is_published BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 全文搜索索引
CREATE INDEX idx_notes_search ON notes USING gin(to_tsvector('english', title || ' ' || content));
```