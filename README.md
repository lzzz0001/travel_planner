# AI 旅行规划助手

<!-- 触发Actions工作流测试 - 更新时间：2024-01-01 -->

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
docker run -p 8080:80 -p 3001:3001 \n  -e SUPABASE_URL="你的Supabase URL" \n  -e SUPABASE_KEY="你的Supabase密钥" \n  -e ALI_BAILIAN_API_KEY="你的阿里云百炼API密钥" \n  -e IFLYTEK_APPID="你的讯飞AppID" \n  -e BAIDU_MAP_KEY="你的百度地图API密钥" \n  travel_planner:latest
```

### ☁️ 从容器仓库拉取镜像

#### 从阿里云容器镜像服务拉取

1. **登录阿里云容器镜像服务**
   ```bash
   docker login crpi-aoyxexbw214gy7ht.cn-hangzhou.personal.cr.aliyuncs.com -u nick9438919947
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
   docker pull ghcr.io/[你的GitHub用户名]/ai_travel_planner:latest
   # 例如：ghcr.io/nick9438919947/ai_travel_planner:latest
   ```

### 🚀 运行镜像

使用从任一仓库拉取的镜像运行应用：

```bash
# 使用阿里云镜像
 docker run -p 8080:80 -p 3001:3001 \
   -e SUPABASE_URL="你的Supabase URL" \
   -e SUPABASE_KEY="你的Supabase密钥" \
   -e ALI_BAILIAN_API_KEY="你的阿里云百炼API密钥" \
   -e IFLYTEK_APPID="你的讯飞AppID" \
   -e BAIDU_MAP_KEY="你的百度地图API密钥" \
   crpi-aoyxexbw214gy7ht.cn-hangzhou.personal.cr.aliyuncs.com/my_reposiotory/travel_planner:latest

# 或者使用GitHub镜像
 docker run -p 8080:80 -p 3001:3001 \
   -e SUPABASE_URL="你的Supabase URL" \
   -e SUPABASE_KEY="你的Supabase密钥" \
   -e ALI_BAILIAN_API_KEY="你的阿里云百炼API密钥" \
   -e IFLYTEK_APPID="你的讯飞AppID" \
   -e BAIDU_MAP_KEY="你的百度地图API密钥" \
   ghcr.io/[你的GitHub用户名]/ai_travel_planner:latest
```

### 📝 使用简短名称运行 (可选)

```bash
# 给镜像添加简短标签
# 对于阿里云镜像
docker tag crpi-aoyxexbw214gy7ht.cn-hangzhou.personal.cr.aliyuncs.com/my_reposiotory/travel_planner:latest travel_planner:latest

# 或者对于GitHub镜像
docker tag ghcr.io/[你的GitHub用户名]/ai_travel_planner:latest travel_planner:latest

# 然后使用简短名称运行
 docker run -p 8080:80 -p 3001:3001 \
   -e SUPABASE_URL="你的Supabase URL" \
   -e SUPABASE_KEY="你的Supabase密钥" \
   -e ALI_BAILIAN_API_KEY="你的阿里云百炼API密钥" \
   -e IFLYTEK_APPID="你的讯飞AppID" \
   -e BAIDU_MAP_KEY="你的百度地图API密钥" \
   travel_planner:latest
```

### 🔗 访问应用

运行成功后，可以通过以下地址访问：
- **前端应用**：http://localhost:8080
- **后端API**：http://localhost:3001

## 📋 环境变量配置

应用需要配置以下环境变量才能正常运行：

| 环境变量 | 说明 | 必填 |
|---------|------|------|
| SUPABASE_URL | Supabase 项目 URL | 是 |
| SUPABASE_KEY | Supabase API 密钥 | 是 |
| ALI_BAILIAN_API_KEY | 阿里云百炼 API 密钥 | 是 |
| IFLYTEK_APPID | 讯飞开放平台 AppID | 是 |
| BAIDU_MAP_KEY | 百度地图 API 密钥 | 是 |

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
docker run -p 8080:80 -p 3001:3001 travel_planner:latest
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