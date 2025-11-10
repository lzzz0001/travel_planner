#!/usr/bin/env pwsh
# 设置环境变量配置脚本 - PowerShell版本

Write-Host "=== AI旅行规划助手环境变量配置脚本 ==="
Write-Host "请输入以下必要的API密钥以配置应用"
Write-Host "注意：Supabase凭据必须提供，否则应用将使用内存存储（重启后数据丢失）"
Write-Host

# 创建或清空.env文件
$envFilePath = Join-Path -Path $PSScriptRoot -ChildPath "backend\.env"

# 如果文件存在则显示警告
if (Test-Path -Path $envFilePath) {
    Write-Host "警告：backend\.env 文件已存在，将被覆盖！"
    Read-Host "按Enter继续，或按Ctrl+C取消"
}

# 创建目录（如果不存在）
$envDir = Split-Path -Path $envFilePath -Parent
if (-not (Test-Path -Path $envDir)) {
    New-Item -ItemType Directory -Path $envDir | Out-Null
}

# 收集环境变量
$supabaseUrl = Read-Host -Prompt "请输入Supabase URL (例如: https://your-project.supabase.co)"
$supabaseKey = Read-Host -Prompt "请输入Supabase API密钥 (anon key)"
$aliBailianApiKey = Read-Host -Prompt "请输入阿里云百炼API密钥"
$baiduMapKey = Read-Host -Prompt "请输入百度地图API密钥"
$iflytekAppId = Read-Host -Prompt "请输入讯飞开放平台AppID"

# 创建.env文件内容
$envContent = @"
# 服务器配置
NODE_ENV=production
PORT=3001

# Supabase 配置
SUPABASE_URL=$supabaseUrl
SUPABASE_KEY=$supabaseKey

# 阿里云百炼API配置
ALI_BAILIAN_API_KEY=$aliBailianApiKey

# 百度地图API配置
BAIDU_MAP_KEY=$baiduMapKey

# 讯飞语音识别API配置
IFLYTEK_APPID=$iflytekAppId
"@

# 写入文件
Set-Content -Path $envFilePath -Value $envContent -Encoding UTF8

Write-Host ""
Write-Host "✅ 环境变量配置完成！"
Write-Host "文件已保存至: $envFilePath"
Write-Host ""
Write-Host "现在可以使用以下命令运行应用："
Write-Host "1. 使用Docker命令行:"
Write-Host "   docker run -p 8080:80 -p 3001:3001 -v $(pwd)/backend/.env:/app/backend/.env:ro travel_planner:latest"
Write-Host ""
Write-Host "2. 或使用Docker Compose:"
Write-Host "   先取消docker-compose.yml中volumes部分的注释，然后运行:"
Write-Host "   docker-compose up -d"
Write-Host ""
Write-Host "3. 或直接在docker-compose.yml中设置环境变量值，然后运行:"
Write-Host "   docker-compose up -d"