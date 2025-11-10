# ====== 构建阶段 ======
# 前端构建阶段
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

# 复制前端依赖文件
COPY frontend/package*.json ./

# 安装前端依赖
RUN npm ci

# 复制前端源代码
COPY frontend/ .

# 构建前端应用
RUN npm run build

# ====== 后端准备阶段 ======
FROM node:20-alpine AS backend-prepare
WORKDIR /app/backend

# 复制后端依赖文件
COPY backend/package*.json ./

# 安装后端依赖（只安装生产依赖）
RUN npm ci --only=production

# ====== 最终镜像构建 ======
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 安装Nginx用于服务前端静态文件
RUN apk add --no-cache nginx

# 创建必要的目录
RUN mkdir -p /run/nginx /var/www/html /app/backend

# 复制后端依赖和代码
COPY --from=backend-prepare /app/backend/node_modules /app/backend/node_modules
COPY backend/ /app/backend/

# 复制前端构建产物到Nginx静态目录
COPY --from=frontend-build /app/frontend/dist /var/www/html

COPY frontend/nginx.conf /etc/nginx/http.d/default.conf

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3001

# 安装PM2用于管理多个进程
RUN npm install -g pm2

# 创建启动脚本 - 简化Nginx启动，不使用配置文件
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'mkdir -p /run/nginx' >> /app/start.sh && \
    echo 'nginx -c /etc/nginx/nginx.conf -g "daemon off;" &' >> /app/start.sh && \
    echo 'cd /app/backend && node server.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# 暴露端口
EXPOSE 80 3001

# 启动应用
CMD ["/app/start.sh"]