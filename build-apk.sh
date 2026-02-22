#!/bin/bash
# 构建 APK 脚本

echo "=========================================="
echo "粉红小钱袋 APK 构建脚本"
echo "=========================================="
echo ""

# 进入项目目录
cd /workspace/projects/client

# 登录 Expo（需要手动输入）
echo "正在登录 Expo..."
echo "请按提示输入账号信息："
echo "  邮箱: 56854631@qq.com"
echo "  密码: 19801007"
echo ""
eas login

# 检查登录状态
if ! eas whoami > /dev/null 2>&1; then
    echo "登录失败，请重试"
    exit 1
fi

echo ""
echo "登录成功！"
echo ""

# 配置项目
echo "配置项目..."
eas build:configure --platform android --non-interactive

# 构建 APK
echo ""
echo "开始构建 APK（内测版本）..."
echo "构建大约需要 5-15 分钟，请耐心等待..."
echo ""
eas build --platform android --profile preview --non-interactive

echo ""
echo "=========================================="
echo "构建完成！"
echo "请查看上方输出的下载链接"
echo "=========================================="
