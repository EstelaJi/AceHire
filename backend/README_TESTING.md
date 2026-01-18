# AceHire Backend 测试指南

本文档说明如何在本地环境运行测试，无需使用 Docker。

## 方法一：使用本地 PostgreSQL（推荐）

### 前置要求

1. 安装 PostgreSQL 12+（推荐 14 或 16）
   ```bash
   # macOS 使用 Homebrew
   brew install postgresql@16
   
   # 启动服务
   brew services start postgresql@16
   
   # 或者使用 PostgreSQL.app (https://postgresapp.com/)
   ```

2. 创建测试数据库
   ```bash
   # 使用 psql 连接到 PostgreSQL
   psql postgres
   
   # 在 psql 中执行
   CREATE DATABASE interview_db;
   CREATE USER postgres WITH PASSWORD 'postgres';
   GRANT ALL PRIVILEGES ON DATABASE interview_db TO postgres;
   
   # 退出 psql
   \q
   ```

### 配置环境变量

在项目根目录创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，修改数据库连接字符串：

```env
# 本地开发环境（使用 5432 端口）
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/interview_db

# 测试环境（使用 5433 端口，避免与开发环境冲突）
# 运行测试前设置：export POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/interview_db
```

### 运行测试

#### 方案 A：使用独立的测试数据库（推荐）

创建测试数据库并在独立端口运行：

```bash
# 创建测试数据库
createdb interview_db_test

# 或者使用不同端口
psql -c "CREATE DATABASE interview_db_test;"

# 设置环境变量并运行测试
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/interview_db_test npm test
```

#### 方案 B：直接使用开发数据库

```bash
npm test
```

**注意**：这会在你的开发数据库中创建表并插入测试数据。

## 方法二：使用 Docker（快速启动）

如果你不想在本地安装 PostgreSQL，可以使用 Docker：

```bash
# 启动 PostgreSQL 容器
cd /Users/aether/Documents/agent/alfa2.0/AceHire
docker-compose -f docker-compose.test.yml up -d

# 等待几秒让数据库启动

# 运行测试
POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/interview_db npm test

# 关闭容器
# docker-compose -f docker-compose.test.yml down
```

## 初始化数据库数据

测试数据库创建后，你可以运行种子脚本导入初始数据：

```bash
# 确保 PostgreSQL 正在运行

# 进入 backend 目录
cd /Users/aether/Documents/agent/alfa2.0/AceHire/backend

# 运行种子脚本
npx tsx src/scripts/seed-database.ts
```

这将导入 10 个示例面试问题到数据库。

## 测试说明

### 测试文件位置

`/backend/src/__tests__/questions.test.ts`

### 测试内容

**POST /api/questions 接口测试：**
- ✓ 成功创建新问题
- ✓ 缺少必填字段时返回 400
- ✓ level 无效时返回 400
- ✓ type 无效时返回 400

**GET /api/questions 接口测试：**
- ✓ 获取所有问题
- ✓ 按 level 过滤
- ✓ 按 type 过滤
- ✓ 按 industry 过滤
- ✓ 多条件组合过滤

### 运行特定测试

```bash
# 只运行 POST 接口测试
npm test -- --testNamePattern="POST"

# 只运行 GET 接口测试
npm test -- --testNamePattern="GET"
```

## 常见问题

### 1. 连接错误：FATAL: 28P01

这表示认证失败。检查：
- PostgreSQL 服务是否运行
- 用户名和密码是否正确（默认 `postgres/postgres`）
- 数据库是否存在
- 端口是否正确（默认 5432）

### 2. 端口 5432 被占用

修改测试配置文件中的端口：

```typescript
// backend/src/__tests__/questions.test.ts
const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5434/interview_db',
});
```

### 3. 测试失败：表不存在

测试会自动创建表。确保数据库连接正常。

### 4. 运行测试时报错 "Cannot find module"

确保已安装依赖：

```bash
cd backend
npm install
```

## 清理测试数据

```bash
# 删除测试数据库
dropdb interview_db_test

# 或者在 psql 中
psql -c "DROP DATABASE interview_db_test;"
```

## 下一步

测试通过后，你可以启动开发服务器：

```bash
cd /Users/aether/Documents/agent/alfa2.0/AceHire/backend
npm run dev
```

然后访问 http://localhost:3000/api/questions 测试 API。
