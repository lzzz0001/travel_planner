#!/usr/bin/env node
// 环境变量测试脚本 - 验证环境变量是否正确配置

const fs = require('fs');
const path = require('path');

econsole.log('=== AI旅行规划助手 - 环境变量测试脚本 ===');
econsole.log('此脚本用于验证您的环境变量配置是否正确');
econsole.log();

// 检查环境变量文件是否存在
const envFilePath = path.join(__dirname, 'backend', '.env');

if (!fs.existsSync(envFilePath)) {
    console.log('❌ 错误：未找到 backend/.env 文件');
    console.log('请按照以下步骤创建环境变量文件：');
    console.log('1. 复制 backend/.env.example 为 backend/.env');
    console.log('2. 编辑 .env 文件，填入实际的API密钥');
    console.log('3. 或运行 setup_env.ps1（Windows）或 setup_env.sh（Linux/Mac）脚本');
    process.exit(1);
}

console.log('✅ 找到 backend/.env 文件');

// 读取环境变量文件
const envContent = fs.readFileSync(envFilePath, 'utf8');
const envVars = {};

// 解析环境变量
envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
        const [key, value] = line.split('=').map(part => part.trim());
        if (key && value) {
            envVars[key] = value;
        }
    }
});

// 检查必需的环境变量
const requiredVars = [
    { key: 'SUPABASE_URL', desc: 'Supabase URL', critical: true },
    { key: 'SUPABASE_KEY', desc: 'Supabase API密钥', critical: true },
    { key: 'ALI_BAILIAN_API_KEY', desc: '阿里云百炼API密钥', critical: false },
    { key: 'BAIDU_MAP_KEY', desc: '百度地图API密钥', critical: false },
    { key: 'IFLYTEK_APPID', desc: '讯飞开放平台AppID', critical: false }
];

let hasCriticalError = false;
console.log('\n检查必需的环境变量：');
console.log('========================');

requiredVars.forEach(({ key, desc, critical }) => {
    if (!envVars[key] || envVars[key].includes('your_')) {
        console.log(`❌ ${desc} (${key}) 未配置或使用默认占位符`);
        if (critical) {
            hasCriticalError = true;
            console.log(`   ⚠️  警告：${desc} 是必需的，未配置将使用内存存储！`);
        }
    } else {
        console.log(`✅ ${desc} (${key}) 已配置`);
        // 部分隐藏敏感信息
        const maskedValue = key.includes('KEY') || key.includes('SECRET') 
            ? envVars[key].substring(0, 6) + '...' + envVars[key].substring(envVars[key].length - 4)
            : envVars[key];
        console.log(`   示例: ${maskedValue}`);
    }
});

console.log('\n========================');

// 提供运行建议
if (hasCriticalError) {
    console.log('\n❌ 检测到关键错误：');
    console.log('1. Supabase 凭据未正确配置，这将导致应用使用内存存储（重启后数据丢失）');
    console.log('2. 请确保提供有效的 Supabase URL 和 API 密钥');
    console.log();
    console.log('运行建议：');
    console.log('1. 编辑 backend/.env 文件，填入实际的 Supabase 凭据');
    console.log('2. 或运行环境变量配置脚本：');
    console.log('   - Windows: .\\setup_env.ps1');
    console.log('   - Linux/Mac: bash setup_env.sh');
} else {
    console.log('\n✅ 环境变量配置检查通过！');
    console.log('现在您可以使用以下命令运行应用：');
    console.log();
    console.log('1. 使用Docker命令行：');
    console.log('   docker run -p 8080:80 -p 3001:3001 \\');
    console.log('     -v $(pwd)/backend/.env:/app/backend/.env:ro \\');
    console.log('     travel_planner:latest');
    console.log();
    console.log('2. 或使用Docker Compose：');
    console.log('   编辑 docker-compose.yml，取消volumes部分的注释，然后运行：');
    console.log('   docker-compose up -d');
}

console.log('\n=== 测试完成 ===');