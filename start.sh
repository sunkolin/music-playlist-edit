#!/bin/bash

# 歌单编辑器启动脚本
# 功能：先构建前端，然后启动 Node 后端服务（同时托管前端静态资源）

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN} 歌单编辑器启动脚本${NC}"
echo "================================"

# 检查 Node.js 是否已安装
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: 未检测到 Node.js，请先安装 Node.js${NC}"
    exit 1
fi

echo -e "${YELLOW}检测到 Node.js 版本: $(node -v)${NC}"

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# 第一步：安装后端依赖
echo ""
echo -e "${YELLOW}[1/3] 安装后端依赖...${NC}"
cd "$BACKEND_DIR"
if [ ! -d "node_modules" ]; then
    echo "正在安装后端依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}后端依赖安装失败${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ 后端依赖安装完成${NC}"
else
    echo "后端依赖已存在，跳过安装"
fi

# 第二步：安装前端依赖并构建
echo ""
echo -e "${YELLOW}[2/3] 安装前端依赖并构建...${NC}"
cd "$FRONTEND_DIR"
if [ ! -d "node_modules" ]; then
    echo "正在安装前端依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}前端依赖安装失败${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ 前端依赖安装完成${NC}"
else
    echo "前端依赖已存在，跳过安装"
fi

# 构建前端
echo "正在构建前端..."
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}前端构建失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 前端构建完成${NC}"

# 复制前端构建产物到后端 dist 目录
echo "正在部署前端文件..."
rm -rf "$BACKEND_DIR/dist"
cp -r "$FRONTEND_DIR/dist" "$BACKEND_DIR/dist"
echo -e "${GREEN}✓ 前端文件部署完成${NC}"

# 第三步：启动后端服务
echo ""
echo -e "${YELLOW}[3/3] 启动服务...${NC}"
cd "$BACKEND_DIR"
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}🚀 服务启动成功！${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "🌐 访问地址: ${GREEN}http://localhost:3000${NC}"
echo -e " API 地址: ${GREEN}http://localhost:3000/api${NC}"
echo ""
echo -e "按 ${RED}Ctrl+C${NC} 停止服务"
echo ""

# 启动 Node.js 服务
exec node app.js
