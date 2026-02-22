#!/bin/bash
# Zeabur 快速部署脚本
# 使用方法：在项目根目录运行此脚本

echo "=== Zeabur 快速部署脚本 ==="
echo ""

# 检查是否在项目根目录
if [ ! -d "server" ] || [ ! -d "client" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 检查 Zeabur CLI 是否安装
if ! command -v zb &> /dev/null; then
    echo "📦 正在安装 Zeabur CLI..."
    curl -fsSL https://raw.githubusercontent.com/zeabur/cli/main/scripts/install.sh | bash
fi

echo ""
echo "✅ 准备工作完成！"
echo ""
echo "📋 接下来请按以下步骤操作："
echo ""
echo "1️⃣  登录 Zeabur（浏览器会自动打开）："
echo "    zb login"
echo ""
echo "2️⃣  初始化项目："
echo "    cd server"
echo "    zb init"
echo ""
echo "3️⃣  配置环境变量（在 Zeabur 控制台中）："
echo "    NODE_ENV=production"
echo "    PORT=9091"
echo "    SUPABASE_URL=你的SupabaseURL"
echo "    SUPABASE_ANON_KEY=你的SupabaseKey"
echo ""
echo "4️⃣  部署："
echo "    zb deploy"
echo ""
echo "5️⃣  获取访问地址："
echo "    zb service list"
echo ""
