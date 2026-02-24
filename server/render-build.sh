#!/bin/bash
# Render 构建脚本

echo "=== Starting Render Build ==="

# 进入 server 目录
cd server

# 安装依赖并构建
echo "Installing dependencies..."
npm install

echo "Building..."
npm run build

echo "Build completed!"
