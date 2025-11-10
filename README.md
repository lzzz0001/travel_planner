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

### ☁️ 从容器仓库拉取镜像（两种方法）

#### 1.从阿里云容器镜像服务拉取

1. **登录阿里云容器镜像服务**
   ```bash
   # 阿里云个人镜像仓库登录（仅仓库所有者需要，其他用户无需登录即可拉取公共镜像）
   # docker login crpi-aoyxexbw214gy7ht.cn-hangzhou.personal.cr.aliyuncs.com -u [您的阿里云用户名]
   ```

2. **拉取镜像**
   ```bash
   docker pull crpi-aoyxexbw214gy7ht.cn-hangzhou.personal.cr.aliyuncs.com/my_reposiotory/travel_planner:latest
   ```

#### 2.从GitHub Container Registry拉取

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

### 🚀 运行镜像（区分以上两种方法）

```bash
# 方法1：如果使用阿里云容器镜像服务镜像
docker run -p 8080:80 -p 3001:3001 crpi-aoyxexbw214gy7ht.cn-hangzhou.personal.cr.aliyuncs.com/my_reposiotory/travel_planner:latest

# 方法2：如果使用GitHub Container Registry镜像
docker run -p 8080:80 -p 3001:3001 ghcr.io/lzzz0001/travel_planner:latest
```

### 🔧 配置API KEY步骤
1. 启动容器（如上命令所示）
2. 访问应用：打开浏览器访问 http://localhost:8080
3. 点击右上角的设置按钮
4. 输入您的Supabase URL、API密钥等配置
5. 点击保存，然后**一定要记得**点击最上面的刷新状态，确保配置生效。

使用命名卷 `travel_planner_config` 确保配置在容器重启后仍然保留。

### 🔗 访问应用

运行成功后，可以通过以下地址访问：
- **前端应用**：http://localhost:8080
- **后端API**：http://localhost:3001

## 📝 使用说明

1. **语音输入提示**：语音需要一口气说完，如果有停顿，后面说的话会覆盖前面的文字。
2. **行程详情查看**：生成旅行规划之后，点击行程详情即可查看完整的旅行计划。
3. **地图使用说明**：
   - 地图上会显示旅游景点（红色的标记，点击可查看详情）
   - 由于各省的某些地名可能重名，导致其他省可能也有红色的标记
   - 有时需手动把地图移到想旅游的城市来查看正确的景点标记

## 📋 环境变量配置

应用需要以下环境变量才能正常运行，尤其是Supabase凭据是必须的，否则会使用内存存储（重启后数据丢失）：

| 环境变量 | 描述 | 是否必需 |
|---------|------|---------|
| SUPABASE_URL | Supabase 项目 URL | **是** |
| SUPABASE_KEY | Supabase API 密钥 | **是** |
| ALI_BAILIAN_API_KEY | 阿里云百炼DashScope API 密钥 | 是 |
| IFLYTEK_APPID | 讯飞开放平台 AppID | 是 |
| BAIDU_MAP_KEY | 百度地图 API 密钥 | 是 |

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