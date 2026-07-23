# MCP 清单

> MCP 用于接入实时外部数据或操作能力。部署前必须检查目标 agent 的现有 MCP 配置;名称不同但能力相同也视为已安装,不得重复添加。

## 默认选装

### Context7 - 库文档

- **来源**: https://github.com/upstash/context7
- **作用**:查询当前版本的库、框架和 API 文档,降低依赖过时知识产生错误代码的概率。
- **Codex 安装**:`codex mcp add context7 -- npx -y @upstash/context7-mcp@latest`
- **验证**:`codex mcp get context7`;新会话中确认能列出 Context7 工具。
- **注意**:无需 API key 的本地 stdio 模式可直接使用;已有 `context7` 或等价服务时跳过。

### Playwright - 浏览器自动化

- **来源**: https://github.com/microsoft/playwright-mcp
- **作用**:操作浏览器、检查页面、复现交互和执行端到端验证。
- **Codex 安装**:`codex mcp add playwright -- npx -y @playwright/mcp@latest`
- **验证**:`codex mcp get playwright`;新会话中确认能列出 Playwright 工具并打开测试页面。
- **注意**:浏览器控制具有较高权限。不要在含敏感登录态的个人浏览器配置中运行不可信任务。

## 部署规则

1. 先运行目标 agent 的 MCP 列表命令,按名称、包名和能力去重。
2. 默认只安装用户勾选的 MCP;不得把下方候选推荐自动装入。
3. 优先使用维护方官方仓库、官方远程端点或官方发布包。
4. Token、API key 和密码只通过环境变量或 agent 的认证存储传入,不得写入本仓库。
5. 安装后重启 agent,确认服务 enabled 且工具可调用;仅出现在配置文件中不算验证成功。
6. 文件系统、Git、Shell、HTTP 抓取等 agent 已原生具备的能力,默认不再安装同类 MCP。

## 候选推荐(不默认安装)

| MCP | 适用场景 | 建议 |
|---|---|---|
| **GitHub MCP** | Issue、PR、Actions、仓库管理 | 经常需要操作远程 GitHub 时装;本地 Git 工作不需要 |
| **OpenAI Developer Docs** | 开发 OpenAI API、Agents SDK、Codex 集成 | 做 OpenAI 项目时装,官方端点为 `https://developers.openai.com/mcp` |
| **Sentry MCP** | 查询线上错误、Issue 和性能上下文 | 项目已使用 Sentry 且需要排障时装 |
| **数据库 MCP** | 查询 PostgreSQL、SQLite 等真实数据 | 仅按具体数据库安装,优先只读账号和最小权限 |
| **Notion/Slack 等连接器** | 读取团队文档和沟通上下文 | 团队数据确实在对应平台时装,需要单独审查授权范围 |
| **Chrome DevTools MCP** | 性能分析、网络和 DevTools 深度诊断 | Playwright 不够用时再装,两者功能有重叠 |

不建议默认安装通用 filesystem、git、fetch、memory 或 sequential-thinking MCP。Coding agent 通常已有对应能力,重复服务会增加工具选择噪声、启动时间和权限面。
