# dev-habit-pack

跨终端 Coding Agent 的开发习惯配置包。工具无关,按需选装。

支持工具:opencode(已验证 1.17.14)、Claude Code、Codex 等有 hook/instructions 能力的 agent。

## 功能清单

部署时**按需选装**,每项独立开关。分三类:

### A. 习惯规则(注入 instructions 文件,工具无关)

| 功能 | 作用 | 依赖 | 备注 |
|---|---|---|---|
| **A1 对话时间戳** | 每轮回复正文第一行输出 `⏱ HH:MM:SS +08 · prev Ns`(北京时间 + 本轮耗时) | 无 | AI 自输出。<2s 不输出 |
| **A2 子任务显示** | 触发过子任务的轮次,末尾加 `🧵 子任务:活跃 X / 累计 Y · 最长 Zs` | 无 | 工具原生显示则免 |
| **A3 状态行** | 终端状态行渲染 model/dir/进度/花费 | 工具支持可脚本化状态行 | opencode 无 → 豁免;Claude 有 `statusLine` |
| **A4 Skill 优先** | 请求匹配 skill 描述时优先调 `skill` 工具,不凭记忆答 | 工具支持 skill | — |

### B. 系统通知(需本地脚本 + 工具 hook)

| 功能 | 作用 | 依赖 | 备注 |
|---|---|---|---|
| **B1 完成通知** | AI 回复完成弹 Win11 toast「对话完成」 | pwsh 7 + BurntToast | 见下方各工具接线 |
| **B2 确认通知** | 需权限确认时弹 toast「需确认」 | pwsh 7 + BurntToast | — |

### C. 外部插件(agent 自己装,不搬仓库,详见 registry.md)

| 功能 | 作用 | 依赖 | 备注 |
|---|---|---|---|
| **C1 caveman** | agent 说话像 caveman,砍 ~65% output token | Node ≥18 | 可切 lite/full/ultra/wenyan |
| **C2 rtk** | 自动改写 bash 命令加 `rtk ` 前缀,压输出省 60-90% token | rtk 二进制 | 透明,agent 无需手动加前缀 |

## 结构

```
dev-habit-pack/
├── features.md    # 习惯规则(A 类)全文。注入 agent instructions 文件。
├── registry.md    # 插件清单(C 类)+ 通知脚本(B 类)接线方式。
├── scripts/       # 通知脚本 on_stop.ps1 / on_ask.ps1(B 类必需)。
└── cache/         # 已验证部署快照,按 <tool>/<ver>/ 存。迁移命中直接复制。
```

## 部署流程

### 给被派来部署的 agent

1. **先问用户要哪些功能**。展示上方功能清单(A/B/C),让用户勾选(可全选,可只要通知,可只要 caveman…)。不要默认全装。
2. 查 `cache/<tool>/<ver>/` 是否命中:
   - **命中** → 按用户选择复制对应文件,收工。
   - **没命中** → 继续下面。
3. 探查工具能力(hook / statusLine / skill 目录 / instructions 文件)。
4. 按用户勾选逐项落地:
   - **A 类**:把 features.md 对应节写入工具 instructions 文件(opencode `~/.config/opencode/AGENTS.md`,Claude `~/.claude/CLAUDE.md`,Codex `~/.codex/AGENTS.md`)。
   - **B 类**:脚本从 `scripts/` 复制到工具目录,按 registry.md「通知脚本」节接线(各工具 hook 不同)。
   - **C 类**:读 registry.md,按目标工具安装方式装插件(看 GitHub / 跑安装命令),**不搬仓库**。
   - 工具做不到的能力 → 豁免,不硬塞降级。
5. 部署完让用户验证,可靠后存快照到 `cache/<tool>/<ver>/`。

### 加 / 删功能

- **加习惯规则** → 改 `features.md` 加一节 + 本 README 功能清单加一行。
- **加插件** → 改 `registry.md` 加一条 + 本 README 功能清单加一行。
- **删** → 删对应节/行。

## 已验证快照

- `cache/opencode/1.17.14/` — 含 `MANIFEST.md`(迁移步骤 + 验证清单)+ `NOTES.md`(踩坑笔记,迁移必读)。全功能(A 习惯 + B 通知 + C 插件)。
- `cache/claude-code/2.1.205/` — 含 `MANIFEST.md` + `settings.hooks.patch.md`。已部署 B 通知 + C1 caveman + C2 rtk;A 习惯规则未部署(本次未要求)。

## 各工具通知接线速查(B 类)

| 工具 | 完成通知 | 确认通知 |
|---|---|---|
| **opencode** | AI 用 bash 跑 `on_stop.ps1`(规则写进 instructions,因 plugin hook 有超时坑,详见 NOTES.md) | `permission.ask` 插件 hook → `on_ask.ps1` |
| **Claude Code** | `settings.json` 的 `Stop` hook(command 类型)→ `on_stop.ps1` | `Notification` hook → `on_ask.ps1` |
| **Codex** | `hooks.json` 的 `Stop` hook → `on_stop.ps1` | `PermissionRequest` hook → `on_ask.ps1` |

依赖:pwsh 7 + BurntToast(`Install-Module BurntToast -Scope CurrentUser -Force`)。BurntToast 装在 pwsh 7 模块路径,脚本必须用 `pwsh` 跑(非 powershell.exe 5.1)。
