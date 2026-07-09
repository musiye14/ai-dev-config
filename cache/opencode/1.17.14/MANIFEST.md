# opencode 1.17.14 部署快照

> 已验证可靠的部署快照。迁移时命中此处直接复制 + 按步骤接线。

## 环境

- opencode 1.17.14
- Windows 11 + pwsh 7 + powershell 5.1
- BurntToast 1.1.0(装在 pwsh 7 模块路径)
- caveman v1.9.1(opencode plugin)
- rtk(二进制已装,opencode plugin)

## 文件清单

| 快照文件 | 部署目标 | 作用 |
|---|---|---|
| `plugins/notify/notify.ts` | `~/.config/opencode/plugins/notify/notify.ts` | 通知插件:permission.ask → on_ask.ps1;system.transform 每轮强化时间戳+通知规则 |
| `scripts/on_stop.ps1` | `~/.config/opencode/scripts/on_stop.ps1` | 对话完成通知脚本(BurntToast) |
| `scripts/on_ask.ps1` | `~/.config/opencode/scripts/on_ask.ps1` | 需确认通知脚本(BurntToast) |

## 额外部署步骤(快照外)

1. **装 caveman**(opencode plugin + skills + agents + commands):
   ```
   git clone https://github.com/JuliusBrussee/caveman.git
   node caveman/bin/install.js --only opencode --non-interactive
   ```
   - 自动落位 plugin/commands/agents/skills + patch opencode.json + 写 AGENTS.md caveman 块

2. **修 cavecrew agents**(installer bug,必须手动):
   - 三个文件 `~/.config/opencode/agents/cavecrew-*.md` 的 frontmatter 有 `tools: [...]` 数组
   - opencode 拒绝(要 object)→ **删掉 `tools:` 行**,opencode fallback 默认工具集

3. **装 rtk opencode plugin**:
   ```
   rtk init -g --opencode
   ```
   - 落位 `~/.config/opencode/plugins/rtk.ts`(顶层自动发现,无需注册)

4. **注册 notify plugin** 到 `~/.config/opencode/opencode.json`:
   ```json
   "plugin": [
     "./plugins/caveman/plugin.js",
     "./plugins/notify/notify.ts"
   ]
   ```
   - 注意:rtk.ts 在顶层靠自动发现,不需注册

5. **注入 dev-habit-pack 规则块** 到 `~/.config/opencode/AGENTS.md`:
   - 见 `AGENTS.md.dev-habit-pack.md`(caveman 块之后追加)

6. **装 BurntToast**(pwsh 7 模块路径):
   ```
   Install-Module BurntToast -Scope CurrentUser -Force
   ```
   - powershell.exe(5.1)找不到此模块,脚本必须用 pwsh 跑

## 验证清单

| # | 项 | 方法 | 成功标准 |
|---|---|---|---|
| 1 | opencode 启动 | `opencode` | 无 config 报错进 TUI |
| 2 | caveman 激活 | 说 `caveman mode` | 回复变 caveman 风格 |
| 3 | rtk 改写 | 让 AI 跑 `git status` | 命令变 `rtk git status` |
| 4 | 完成通知 | 发消息等回复完成 | 弹 toast「对话完成」 |
| 5 | 确认通知 | 触发权限确认 | 弹 toast「需确认」 |
| 6 | 时间戳 | 任意回复 | 首行 `⏱ HH:MM:SS +08 · prev Ns` |
| 7 | cavecrew 子agent | 说 `用 cavecrew-reviewer 审 diff` | 子agent 启动 |

关键 3 项:#1 启动、#4 完成通知、#6 时间戳。
