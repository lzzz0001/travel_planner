# 阿里云镜像仓库(GitHub Actions)配置指南

本文档详细说明了如何配置GitHub Actions，将项目的Docker镜像自动构建并推送到阿里云容器镜像服务(ACR)。

## 前提条件

1. 已注册阿里云账号
2. 已在阿里云容器镜像服务中创建了命名空间
3. 已在GitHub上拥有项目仓库

## 步骤1：在阿里云创建访问凭证

1. 登录阿里云控制台
2. 进入容器镜像服务(ACR)控制台
3. 点击左侧菜单中的「访问凭证」
4. 创建或使用已有访问凭证，获取以下信息：
   - 用户名（通常是固定的`registry`）
   - 密码（访问凭证密码）

## 步骤2：配置GitHub仓库密钥

在GitHub仓库的Settings > Secrets and variables > Actions中，添加以下密钥：

| 密钥名称 | 说明 | 示例值 |
|---------|------|--------|
| `ALI_REGISTRY` | 阿里云容器镜像服务地址 | `registry.cn-hangzhou.aliyuncs.com` |

### 如何确认您的阿里云容器镜像服务地址

要找到您实际的阿里云容器镜像服务地址，请按照以下步骤操作：

1. 登录阿里云控制台
2. 进入容器镜像服务(ACR)控制台
3. 在左侧导航栏中点击「镜像仓库」
4. 选择您创建的命名空间
5. 进入任意一个镜像仓库（如果没有可以先创建一个测试仓库）
6. 在页面右上角找到「仓库信息」部分
7. 复制「公网地址」或「内网地址」
8. 公网地址格式通常为：`registry.cn-[区域].aliyuncs.com`

**区域说明**：
- 杭州：`registry.cn-hangzhou.aliyuncs.com`
- 上海：`registry.cn-shanghai.aliyuncs.com`
- 北京：`registry.cn-beijing.aliyuncs.com`
- 深圳：`registry.cn-shenzhen.aliyuncs.com`
- 青岛：`registry.cn-qingdao.aliyuncs.com`
- 香港：`registry.cn-hongkong.aliyuncs.com`
- 新加坡：`registry.cn-singapore.aliyuncs.com`

请根据您的实际阿里云账号开通的区域选择对应的地址。
| `ALI_REGISTRY_NAMESPACE` | 镜像命名空间 | `my-namespace` |
| `ALI_REGISTRY_USERNAME` | 访问凭证用户名 | `registry` |
| `ALI_REGISTRY_PASSWORD` | 访问凭证密码 | `your-password` |

## 步骤3：理解工作流程

GitHub Actions工作流文件位于`.github/workflows/docker-build-push.yml`，其主要功能：

1. 在推送到`main`或`master`分支时触发
2. 检出代码并设置Docker Buildx
3. 登录到阿里云容器镜像服务
4. 构建统一的Docker镜像（集成了前端和后端）并推送到阿里云
5. 镜像会添加`latest`标签和基于commit SHA的标签

## 步骤4：本地测试

在将代码推送到GitHub之前，可以在本地测试Docker构建。现在使用统一的Dockerfile：

```bash
# 构建统一镜像
docker build -t travel_planner:latest .

# 运行统一镜像
docker run -p 80:80 -p 3001:3001 travel_planner:latest
```

## 步骤5：使用推送的镜像

成功推送后，可以从阿里云镜像仓库拉取统一镜像：

```bash
# 拉取统一镜像
docker pull [registry地址]/[命名空间]/travel_planner:latest

# 运行镜像
docker run -p 80:80 -p 3001:3001 [registry地址]/[命名空间]/travel_planner:latest
```

## 统一镜像说明

统一镜像将前端和后端集成在同一个容器中：

1. 前端使用Nginx提供静态文件服务，暴露在80端口
2. 后端Node.js服务暴露在3001端口
3. Nginx配置自动将/api请求代理到后端服务
4. 使用启动脚本同时启动Nginx和Node.js服务

### 环境变量

运行镜像时，可以通过环境变量配置后端服务：

```bash
docker run -p 80:80 -p 3001:3001 \
  -e API_PORT=3001 \
  -e SUPABASE_URL=your-supabase-url \
  -e SUPABASE_KEY=your-supabase-key \
  [registry地址]/[命名空间]/travel_planner:latest
```

### 数据持久化

如需数据持久化，可以挂载卷：

```bash
docker run -p 80:80 -p 3001:3001 \
  -v ./backend/data:/app/backend/data \
  [registry地址]/[命名空间]/travel_planner:latest
```

```bash
docker run -p 80:80 -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  [registry地址]/[命名空间]/travel_planner:latest
```

### 数据持久化

如需持久化数据，请将相应目录挂载到容器外部：

```bash
docker run -p 80:80 -p 3001:3001 \
  -v ./data:/app/backend/data \
  [registry地址]/[命名空间]/travel_planner:latest
```

## 常见问题

### 构建失败

1. 检查Dockerfile语法是否正确
2. 确保仓库中的代码是可构建的
3. 查看GitHub Actions日志获取详细错误信息

### 推送失败

1. 检查GitHub Secrets配置是否正确
2. 确认阿里云访问凭证是否有效
3. 确保您在阿里云的命名空间有写入权限

### 镜像大小优化

当前配置已经使用了多阶段构建和缓存优化，但还可以考虑：

1. 在Dockerfile中使用更精简的基础镜像
2. 使用`.dockerignore`文件排除不必要的文件
3. 优化构建缓存策略

## 更多资源

- [阿里云容器镜像服务文档](https://help.aliyun.com/product/60716.html)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Docker Buildx 文档](https://docs.docker.com/build/buildx/)