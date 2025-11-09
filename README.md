# AI 旅行规划助手

一款基于 AI 技术的智能旅行规划工具，帮助用户轻松创建个性化旅行行程，支持语音输入、预算管理和多设备同步。

## ✨ 核心功能

- **🎤 语音规划**：通过语音识别快速描述旅行需求
- **🤖 AI 行程生成**：智能生成详细的多日旅行计划
- **💰 预算管理**：实时跟踪支出并提供预算提醒
- **🗺️ 交互式地图**：可视化旅行路线和目的地
- **☁️ 云端同步**：多设备无缝访问和同步旅行计划
- **🔐 用户认证**：安全保存和管理多个旅行计划

## 🛠️ 技术栈

- **前端**：React + Vite + CSS3
- **后端**：Node.js + Express
- **数据库**：Supabase
- **语音识别**：Web Speech API + 讯飞接口
- **地图服务**：百度地图 API
- **AI 服务**：阿里云百炼 API
- **部署**：Docker + Docker Compose

## 📁 项目结构

```
AI_Travel_Planner/
├── frontend/                 # React 前端应用
│   ├── src/                  # 源代码
│   │   ├── components/       # React 组件
│   │   ├── services/         # API 服务
│   │   ├── utils/            # 工具函数
│   │   ├── App.jsx           # 主应用组件
│   │   └── main.jsx          # 入口文件
│   └── vite.config.js        # Vite 配置
├── backend/                  # Node.js 后端服务
│   ├── server.js             # 主服务器文件
│   ├── create-table-sql.sql  # 数据库表结构
│   └── init-supabase.js      # Supabase 初始化
├── docs/                     # 项目文档
├── docker-compose.yml        # Docker 编排配置
└── README.md                 # 项目说明文档
```

## 🚀 快速开始

### 环境要求

- Node.js (v14 或更高版本)
- npm (v6 或更高版本)
- Docker (可选，用于容器化部署)

### 本地开发

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd AI_Travel_Planner
   ```

2. **安装依赖**
   ```bash
   # 前端依赖
   cd frontend
   npm install
   cd ..
   
   # 后端依赖
   cd backend
   npm install
   cd ..
   ```

3. **配置环境变量**
   ```bash
   # 前端配置
   cd frontend
   cp .env.example .env
   # 编辑 .env 文件，填入实际 API 密钥
   
   # 后端配置
   cd ../backend
   cp .env.example .env
   # 编辑 .env 文件，填入实际 API 密钥
   ```

4. **启动开发服务器**
   ```bash
   # 启动后端 (在 backend 目录)
   npm run dev
   # 后端将在 3001 端口运行
   
   # 启动前端 (在 frontend 目录)
   npm run dev
   # 前端将在 5173 端口运行
   ```

5. **访问应用**：浏览器打开 `http://localhost:5173`

### Docker 部署

使用 Docker Compose 快速部署整个应用：

1. **启动服务**
   ```bash
   docker-compose up --build
   ```

2. **访问应用**
   - 前端：http://localhost
   - 后端 API：http://localhost:3001

3. **停止服务**
   ```bash
   docker-compose down
   ```

## ⚙️ 关键配置

### API 密钥配置

应用需要以下 API 密钥才能完全运行：

1. **阿里云**：用于 AI 行程生成
2. **讯飞**：用于语音识别服务
3. **百度地图**：用于地图可视化
4. **Supabase**：用于数据存储和同步

所有 API 密钥通过环境变量配置，确保安全管理。详细配置指南请参考 [设置文档](docs/setup.md)。

### 数据库配置

项目使用 Supabase 作为数据库服务。首次设置时，需执行以下步骤：

1. 创建 Supabase 项目
2. 在项目中执行 `create-table-sql.sql` 中的 SQL 语句
3. 在 `.env` 文件中配置 Supabase URL 和 API 密钥

## 🔍 主要功能说明

### 1. AI 行程规划
- 支持通过语音或文本描述旅行需求
- AI 自动生成详细行程，包括：
  - 每日活动安排
  - 住宿推荐
  - 交通方案
  - 餐饮建议
  - 预算估算

### 2. 预算管理
- 实时记录和分类旅行支出
- 可视化消费模式
- 超出预算提醒

### 3. 多设备同步
- 旅行计划自动同步至云端
- 支持在不同设备上查看和编辑
- 离线编辑，在线同步

## 🔒 安全措施

- 用户认证与授权保护
- API 密钥通过环境变量管理
- 数据传输使用 HTTPS
- 本地数据缓存与云端同步双重保障

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！贡献流程：

1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📜 许可证

本项目采用 MIT 许可证 - 详情请查看 [LICENSE](LICENSE) 文件

## 💬 支持与反馈

- 有问题请提交 [Issue](https://github.com/yourusername/AI_Travel_Planner/issues)
- 功能建议可通过 Pull Request 或 Issue 提出