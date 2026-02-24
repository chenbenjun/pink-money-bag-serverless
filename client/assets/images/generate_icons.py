#!/usr/bin/env python3
from PIL import Image, ImageOps
import os

# 打开新图标
input_path = '/workspace/projects/client/assets/images/logo-new.png'
output_dir = '/workspace/projects/client/assets/images'

with Image.open(input_path) as img:
    print(f'原图尺寸: {img.size}')
    print(f'模式: {img.mode}')
    
    # 转换为 RGBA 模式（支持透明度）
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # 生成不同尺寸的图标
    sizes = {
        'icon.png': (1024, 1024),      # 主图标
        'adaptive-icon.png': (1024, 1024),  # 自适应图标
        'favicon.png': (192, 192),     # Web 图标
        'splash-icon.png': (200, 200), # 启动页图标
    }
    
    for filename, size in sizes.items():
        # 使用高质量缩放算法
        resized = img.resize(size, Image.Resampling.LANCZOS)
        
        # 保存为 PNG
        output_path = os.path.join(output_dir, filename)
        resized.save(output_path, 'PNG', optimize=True)
        print(f'✅ 已生成 {filename} ({size[0]}x{size[1]})')

print('\n🎉 所有图标生成完成！')
