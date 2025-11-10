# AI 旅行规划助手

<!-- 触发Actions工作流测试 - 更新时间：2025-11-10 -->

一款基于 AI 技术的智能旅行规划工具，帮助用户轻松创建个性化旅行行程，支持语音输入、预算管理和多设备同步。

## ✨ 核心功能

- **🎤 语音规划**：通过语音识别快速描述旅行需求
- **🤖 AI 行程生成**：智能生成详细的多日旅行计划
- **💰 预算管理**：实时跟踪支出并提供预算提醒
- **🗺️ 交互式地图**：可视化旅行路线和目的地
- **☁️ 云端同步**：多设备无缝访问和同步旅行计划

## 🚀 快速开始 (使用 Docker 镜像)

### 📦 使用本地构建的 Docker 镜像

#### 前提条件
- 已安装 Docker
- 已构建项目镜像 (详见 [构建说明](#构建-docker-镜像))

#### 运行镜像

```bash
docker run -p 8080:80 -p 3001:3001 \
    -v travel_planner_config:/app/backend/config.json \
    ghcr.io/lzzzz0001/travel_planner:latest
  
  # 或使用特定版本
  docker run -p 8080:80 -p 3001:3001 \
    -v travel_planner_config:/app/backend/config.json \
    ghcr.io/lzzzz0001/travel_planner:e80922441c086e97ce2b6a0af7f1bf0b12842737
```

### ☁️ 从容器仓库拉取镜像

#### 从阿里云容器镜像服务拉取

1. **登录阿里云容器镜像服务**
   ```bash
   # 阿里云个人镜像仓库登录（仅仓库所有者需要，其他用户无需登录即可拉取公共镜像）
   # docker login crpi-aoyxexbw214gy7ht.cn-hangzhou.personal.cr.aliyuncs.com -u [您的阿里云用户名]
   ```

2. **拉取镜像**
   ```bash
   docker pull crpi-aoyxexbw214gy7ht.cn-hangzhou.personal.cr.aliyuncs.com/my_reposiotory/travel_planner:latest
   ```

#### 从GitHub Container Registry拉取

1. **登录GitHub Container Registry**
   ```bash
   docker login ghcr.io
   # 使用你的GitHub用户名和个人访问令牌(PAT)登录
   # 个人访问令牌需要有write:packages和read:packages权限
   ```

2. **拉取镜像**
   ```bash
   # 拉取最新版本镜像
   docker pull ghcr.io/lzzz0001/travel_planner:latest
   
   # 或拉取特定版本镜像
   docker pull ghcr.io/lzzz0001/travel_planner:e80922441c086e97ce2b6a0af7f1bf0b12842737
   ```
   > 注意：GitHub Container Registry上的镜像为公共镜像，任何用户无需登录即可直接拉取。

### 🚀 运行镜像

```bash
# 方法1：使用GitHub Container Registry镜像（推荐，公共可访问）
docker run -p 8080:80 -p 3001:3001 \
  -v travel_planner_config:/app/backend/config.json \
  ghcr.io/lzzz0001/travel_planner:e80922441c086e97ce2b6a0af7f1bf0b12842737

# 方法2：使用阿里云容器镜像服务镜像
docker run -p 8080:80 -p 3001:3001 \
  -v travel_planner_config:/app/backend/config.json \
  crpi-aoyxexbw214gy7ht.cn-hangzhou.personal.cr.aliyuncs.com/my_reposiotory/travel_planner:e80922441c086e97ce2b6a0af7f1bf0b12842737
```

配置API KEY步骤：
1. 启动容器（如上命令所示）
2. 访问应用：打开浏览器访问 http://localhost:8080
3. 点击右上角的设置按钮
4. 输入您的Supabase URL、API密钥等配置
5. 点击保存，配置将自动持久化并应用

使用命名卷 `travel_planner_config` 确保配置在容器重启后仍然保留。

### 🔗 访问应用

运行成功后，可以通过以下地址访问：
- **前端应用**：http://localhost:8080
- **后端API**：http://localhost:3001

## 📋 环境变量配置

应用需要以下环境变量才能正常运行，尤其是Supabase凭据是必须的，否则会使用内存存储（重启后数据丢失）：

| 环境变量 | 描述 | 是否必需 |
|---------|------|---------|
| SUPABASE_URL | Supabase 项目 URL | **是** |
| SUPABASE_KEY | Supabase API 密钥 | **是** |
| ALI_BAILIAN_API_KEY | 阿里云百炼 API 密钥 | 是 |
| IFLYTEK_APPID | 讯飞开放平台 AppID | 是 |
| BAIDU_MAP_KEY | 百度地图 API 密钥 | 是 |

### 设置环境变量的方法

#### 方法1：通过Docker命令行传递

```bash
docker run -p 8080:80 -p 3001:3001 \
  -e SUPABASE_URL=your_actual_supabase_url \
  -e SUPABASE_KEY=your_actual_supabase_key \
  -e ALI_BAILIAN_API_KEY=your_actual_ali_bailian_api_key \
  -e IFLYTEK_APPID=your_actual_iflytek_appid \
  -e BAIDU_MAP_KEY=your_actual_baidu_map_key \
  travel_planner:latest
```

#### 方法2：使用Docker Compose

修改 `docker-compose.yml` 文件中的环境变量值，然后运行：

```bash
docker-compose up -d
```

#### 方法3：使用环境变量文件（推荐）

1. **使用配置脚本（最简单）**：
   - Windows系统：
     ```powershell
     .\\setup_env.ps1
     ```
   - Linux/Mac系统：
     ```bash
     chmod +x setup_env.sh
     ./setup_env.sh
     ```

2. **手动配置**：
   - 复制 `.env.example` 文件创建 `.env` 文件：
     ```bash
     cp backend/.env.example backend/.env
     ```
   - 编辑 `.env` 文件，填入实际的API密钥

3. **验证配置**：运行环境变量测试脚本检查配置是否正确：
   ```bash
   node test_env.js
   ```

4. 使用以下命令运行容器并挂载环境变量文件：
   ```bash
   docker run -p 8080:80 -p 3001:3001 \
     -v $(pwd)/backend/.env:/app/backend/.env:ro \
     travel_planner:latest
   ```
   
   或者取消 `docker-compose.yml` 中卷挂载的注释，然后使用Docker Compose运行：
   ```bash
   docker-compose up -d
   ```

## 🏗️ 构建 Docker 镜像

如果你想从源码构建镜像：

1. **克隆仓库**
   ```bash
   git clone <repository-url>
   cd AI_Travel_Planner
   ```

2. **构建镜像**
   ```bash
   docker build -t travel_planner:latest .
   ```

## 🐳 Docker Compose 部署

使用 Docker Compose 进行本地开发或测试环境部署：

```bash
docker-compose up --build
```

## 🔧 常见问题

### 端口占用问题

如果遇到 80 端口被占用的情况（常见于 Windows IIS 服务），请使用其他端口，如 8080：

```bash
# 使用GitHub镜像
docker run -p 8080:80 -p 3001:3001 ghcr.io/lzzz0001/travel_planner:latest

# 或使用阿里云镜像
docker run -p 8080:80 -p 3001:3001 crpi-aoyxexbw214gy7ht.cn-hangzhou.personal.cr.aliyuncs.com/my_reposiotory/travel_planner:latest
```

### 镜像名称过长

阿里云镜像默认名称较长，这是正常的 Docker 命名规范。可以使用 `docker tag` 命令添加简短标签。

### API 密钥配置

确保所有必要的 API 密钥都已正确配置。没有配置或配置错误的 API 会导致相应功能不可用。

## 🛠️ 技术栈

- **前端**：React + Vite + CSS3
- **后端**：Node.js + Express
- **数据库**：Supabase
- **语音识别**：Web Speech API + 讯飞接口
- **地图服务**：百度地图 API
- **AI 服务**：阿里云百炼 API

## 📜 许可证

本项目采用 MIT 许可证 - 详情请查看 [LICENSE](LICENSE) 文件