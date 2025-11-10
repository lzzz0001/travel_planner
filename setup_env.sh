#!/bin/bash
# 设置环境变量配置脚本 - Bash版本

echo "=== AI旅行规划助手环境变量配置脚本 ==="
echo "请输入以下必要的API密钥以配置应用"
echo "注意：Supabase凭据必须提供，否则应用将使用内存存储（重启后数据丢失）"
echo

# 创建或清空.env文件
ENV_FILE="backend/.env"

# 如果文件存在则显示警告
if [ -f "$ENV_FILE" ]; then
    echo "警告：backend/.env 文件已存在，将被覆盖！"
    read -p "按Enter继续，或按Ctrl+C取消"
fi

# 创建目录（如果不存在）
mkdir -p "$(dirname "$ENV_FILE")"

# 收集环境变量
read -p "请输入Supabase URL (例如: https://your-project.supabase.co): " SUPABASE_URL
read -p "请输入Supabase API密钥 (anon key): " SUPABASE_KEY
read -p "请输入阿里云百炼API密钥: " ALI_BAILIAN_API_KEY
read -p "请输入百度地图API密钥: " BAIDU_MAP_KEY
read -p "请输入讯飞开放平台AppID: " IFLYTEK_APPID

# 创建.env文件内容
cat > "$ENV_FILE" << EOF
# 服务器配置
NODE_ENV=production
PORT=3001

# Supabase 配置
SUPABASE_URL=$SUPABASE_URL
SUPABASE_KEY=$SUPABASE_KEY

# 阿里云百炼API配置
ALI_BAILIAN_API_KEY=$ALI_BAILIAN_API_KEY

# 百度地图API配置
BAIDU_MAP_KEY=$BAIDU_MAP_KEY

# 讯飞语音识别API配置
IFLYTEK_APPID=$IFLYTEK_APPID
EOF

chmod 600 "$ENV_FILE"  # 设置文件权限，仅所有者可读写

echo ""
echo "✅ 环境变量配置完成！"
echo "文件已保存至: $ENV_FILE"
echo ""
echo "现在可以使用以下命令运行应用："
echo "1. 使用Docker命令行:"
echo "   docker run -p 8080:80 -p 3001:3001 -v $(pwd)/backend/.env:/app/backend/.env:ro travel_planner:latest"
echo ""
echo "2. 或使用Docker Compose:"
echo "   先取消docker-compose.yml中volumes部分的注释，然后运行:"
echo "   docker-compose up -d"
echo ""
echo "3. 或直接在docker-compose.yml中设置环境变量值，然后运行:"
echo "   docker-compose up -d"