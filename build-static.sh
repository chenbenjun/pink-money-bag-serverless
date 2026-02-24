#!/bin/bash

# 构建 Expo Web 静态版本
echo "=== 构建 Expo Web 静态版本 ==="

cd /workspace/projects/client

# 停止现有的 expo 进程
pkill -9 -f expo

# 导出静态文件
npx expo export --platform web

# 检查是否成功
if [ -d "dist" ]; then
    echo "✅ 静态文件已导出到 dist 目录"
    echo "文件数量: $(find dist -type f | wc -l)"
else
    echo "❌ 导出失败"
    exit 1
fi
