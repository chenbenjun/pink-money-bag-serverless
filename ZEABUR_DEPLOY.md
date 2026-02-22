# Zeabur 部署步骤

## 前置准备
1. 注册 Zeabur 账号：https://zeabur.com
2. 准备好您的 Supabase 配置信息（SUPABASE_URL 和 SUPABASE_ANON_KEY）

---

## 步骤一：创建 Zeabur 项目

1. 登录 Zeabur 控制台：https://dash.zeabur.com
2. 点击 **"New Project"** 或 **"创建项目"**
3. 选择 **"Empty Project"**（空项目）
4. 项目名称填写：`pink-money-bag-backend`（或您喜欢的名字）

---

## 步骤二：添加服务

1. 进入项目后，点击 **"Add Service"** 或 **"添加服务"**
2. 选择 **"Git"** 选项
3. 授权 Zeabur 访问您的 GitHub 仓库
4. 选择您的仓库（包含这个项目的仓库）
5. 分支选择：`main` 或 `master`
6. 根目录设置：`server`（重要！）
7. 点击 **"Deploy"** 或 **"部署"**

---

## 步骤三：配置环境变量

1. 在服务页面，点击 **"Environment Variables"** 或 **"环境变量"**
2. 添加以下环境变量：

```
NODE_ENV=production
PORT=9091
SUPABASE_URL=你的Supabase项目URL
SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

**注意：** 请将上面的 `你的Supabase项目URL` 和 `你的Supabase匿名密钥` 替换为实际的值

---

## 步骤四：等待部署完成

1. Zeabur 会自动开始构建和部署
2. 等待 2-5 分钟（取决于网络）
3. 看到 **"Running"** 或 **"运行中"** 状态表示成功
4. 点击服务卡片查看访问地址（类似：`https://xxx.zeabur.app`）

---

## 步骤五：验证部署

1. 访问您的 Zeabur 地址 + `/api/v1/health`
   - 例如：`https://your-app.zeabur.app/api/v1/health`
2. 应该看到：`{"status":"ok"}`

---

## 步骤六：更新前端配置

1. 将 Zeabur 分配的域名更新到 `client/eas.json` 中
2. 重新打包 APK

---

## 常见问题

### Q: 部署失败怎么办？
A: 查看 Zeabur 控制台的 Logs 标签页，查看错误信息

### Q: 根目录设置错了？
A: 在服务设置中，找到 "Root Directory" 或 "根目录"，修改为 `server`

### Q: 环境变量不生效？
A: 修改环境变量后需要重新部署一次才能生效
