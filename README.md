# 阿里云域名 MCP 服务器

[![npm version](https://img.shields.io/npm/v/mcp-aliyun-domain.svg)](https://www.npmjs.com/package/mcp-aliyun-domain)
[![npm downloads](https://img.shields.io/npm/dm/mcp-aliyun-domain.svg)](https://www.npmjs.com/package/mcp-aliyun-domain)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Registry](https://img.shields.io/badge/MCP-Registry-blue)](https://registry.modelcontextprotocol.io/servers/io.github.lzx3in/mcp-aliyun-domain)

> **免责声明：** 本项目为第三方社区开源工具，与阿里巴巴集团及阿里云无任何关联，非阿里云官方产品。阿里云（Aliyun）及相关标识是阿里巴巴集团的商标。使用本项目前请自行评估风险。

MCP 服务器，集成阿里云域名 API，支持从 AI 助手直接查询域名可用性、获取域名详情、管理域名列表和创建域名注册订单。

## 功能工具

| 工具 | 描述 |
|------|------|
| `check_domain` | 查询域名是否可注册 |
| `query_domain_detail` | 查询域名详细信息 |
| `list_domains` | 列出阿里云账号下的域名列表 |
| `create_order` | 创建域名注册订单 |

## 安装

使用 pnpm（推荐）：

```bash
pnpm install -g mcp-aliyun-domain
```

使用 npm：

```bash
npm install -g mcp-aliyun-domain
```

或者使用 pnpm dlx / npx 直接运行：

```bash
pnpm dlx mcp-aliyun-domain
# 或
npx mcp-aliyun-domain
```

## 配置

### 凭证配置

**方式一：`.env` 文件（推荐）**

复制示例文件并填写您的密钥：

```bash
cp .env.example .env
# 编辑 .env 填入您的 AccessKey
```

**方式二：环境变量**

```bash
export ALIBABA_CLOUD_ACCESS_KEY_ID="your-access-key-id"
export ALIBABA_CLOUD_ACCESS_KEY_SECRET="your-access-key-secret"
```

**方式三：自动发现**

当您未配置任何凭证时，服务器会自动尝试以下来源（按顺序）：
1. 阿里云 CLI 配置（`~/.aliyun/config.json`）
2. 阿里云凭证文件（`~/.alibabacloud/credentials`）
3. ECS RAM 角色（仅在阿里云 ECS 上运行时可用）

适合已在本地配置过阿里云 CLI 或运行在阿里云 ECS 上的用户。

### OpenClaw

**方式一：CLI 命令（推荐）**

```bash
openclaw mcp add aliyun-domain \
  --command npx \
  --arg -y \
  --arg mcp-aliyun-domain \
  --env ALIBABA_CLOUD_ACCESS_KEY_ID=your-key \
  --env ALIBABA_CLOUD_ACCESS_KEY_SECRET=your-secret
```

添加后验证：

```bash
openclaw mcp probe aliyun-domain   # 应显示 4 tools
openclaw mcp reload                # 通知网关加载新配置
```

**方式二：手动编辑配置文件**

在 `~/.openclaw/openclaw.json` 的 `mcp.servers` 中添加：

```json
{
  "mcp": {
    "servers": {
      "aliyun-domain": {
        "command": "npx",
        "args": ["-y", "mcp-aliyun-domain"],
        "env": {
          "ALIBABA_CLOUD_ACCESS_KEY_ID": "your-key",
          "ALIBABA_CLOUD_ACCESS_KEY_SECRET": "your-secret"
        }
      }
    }
  }
}
```

### OpenCode

在 `~/.config/opencode/opencode.jsonc` 中的 `mcp` 字段添加：

```jsonc
{
  "mcp": {
    "aliyun-domain": {
      "type": "local",
      "command": ["npx", "-y", "mcp-aliyun-domain"],
      "environment": {
        "ALIBABA_CLOUD_ACCESS_KEY_ID": "your-key",
        "ALIBABA_CLOUD_ACCESS_KEY_SECRET": "your-secret"
      }
    }
  }
}
```

### Qoder / Qoder CN

在 Qoder MCP 配置文件中添加（Qoder CN 路径为 `~/.config/QoderCN/SharedClientCache/mcp.json`）：

```json
{
  "mcpServers": {
    "aliyun-domain": {
      "command": "npx",
      "args": ["-y", "mcp-aliyun-domain"],
      "env": {
        "ALIBABA_CLOUD_ACCESS_KEY_ID": "your-key",
        "ALIBABA_CLOUD_ACCESS_KEY_SECRET": "your-secret"
      }
    }
  }
}
```

## 使用示例

### 1. 查询域名可用性

**输入：** 帮我查询 `myawesomeapp.com` 是否可以注册

**输出：**
```
域名: myawesomeapp.com
可用性: 可注册 (code: 1)

✅ 该域名可以注册！
建议使用 create_order 工具创建注册订单
```

**输入：** 查询 `google.com` 能否注册

**输出：**
```
域名: google.com
可用性: 不可注册 (code: 0)

不可注册原因: Domain exists
```

### 2. 查询域名详情

**输入：** 查询我的域名 `example.com` 的详细信息

**输出：**
```
域名详情: example.com
========================================
注册者: 张三
组织: 某某科技有限公司
邮箱: admin@example.com
到期时间: 2026-12-31 23:59:59
注册时间: 2020-01-15 10:30:00
状态: 正常
域名验证: SUCCEED
实名认证: SUCCEED
邮箱验证: 已验证
WHOIS 保护: 关闭
DNS1: ns1.aliyun.com
DNS2: ns2.aliyun.com
实例ID: domain-cn-abc123xyz
域名类型: cTLD
距离到期: 1825 天

管理状态:
  自动续费: 开启
  转移锁: 关闭
  更新锁: 关闭
  资源组: rg-acfm363qrffqy6q
```

### 3. 列出域名

**输入：** 列出我账户下的所有域名

**输出：**
```
域名列表 (共 5 个，第 1 页):
==================================================
• mycompany.com [到期: 2026-08-15] (状态: 正常) [审核: SUCCEED] [自动续费: 开启]
• mycompany.cn [到期: 2026-10-20] (状态: 正常) [审核: SUCCEED] [自动续费: 开启]
• mycompany.net [到期: 2026-05-30] (状态: 正常) [审核: SUCCEED] [自动续费: 关闭]
• testdomain.com [到期: 2025-12-01] (状态: 需要续费) [审核: FAILED] [自动续费: 关闭]
• demo-app.cn [到期: 2027-01-10] (状态: 正常) [审核: SUCCEED] [自动续费: 开启]
```

### 4. 创建域名注册订单

**输入：** 帮我注册 `newdomain2025.com`，注册 2 年，使用模板 ID 12345

**输出：**
```
域名注册任务已提交!
==============================
任务编号: 12345678-ABCD-EFGH-1234-567890ABCDEF
任务状态: 0

⚠️ 请前往阿里云控制台完成支付和实名认证。
```

**注意事项：** 创建订单前请务必先使用 `check_domain` 确认可注册性

---

## 开发

```bash
git clone https://github.com/lzx3in/mcp-aliyun-domain
cd mcp-aliyun-domain

# 使用 pnpm（推荐）
pnpm install
pnpm dev          # 使用 tsx 运行（开发模式）
pnpm build        # 编译到 dist/ 目录

# 或使用 npm
npm install
npm run dev       # 使用 tsx 运行（开发模式）
npm run build     # 编译到 dist/ 目录
```

## 许可证

MIT
