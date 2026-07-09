# Claude Code 2.1.205 部署快照

> 已验证可靠的部署快照。迁移时命中此处直接复制 + 按步骤接线。

## 环境

- Claude Code 2.1.205
- Windows 11 + pwsh 7
- BurntToast(pwsh 7 模块路径)
- caveman(Claude plugin)、rtk(二进制 + Claude hook)

## 已部署功能

| 功能 | 状态 | 方式 |
|---|---|---|
| B1 完成通知 | ✅ 已验证 | `settings.json` `hooks.Stop` command → `on_stop.ps1` |
| B2 确认通知 | ✅ 已验证 | `settings.json` `hooks.Notification` command → `on_ask.ps1` |
| C1 caveman | ✅ | `claude plugin install caveman@caveman`(hooks 在 ~/.claude/hooks/,plugin manifest 注册) |
| C2 rtk | ✅ | `rtk init -g`(hook + RTK.md + CLAUDE.md @RTK.md) |
| A1-A4 习惯规则 | ⬜ 未部署 | 本次未要求。需要则把 features.md 写入 ~/.claude/CLAUDE.md |

## 文件清单

| 快照文件 | 部署目标 | 作用 |
|---|---|---|
| `scripts/on_stop.ps1` | `~/.claude/scripts/on_stop.ps1` | 完成通知(BurntToast) |
| `scripts/on_ask.ps1` | `~/.claude/scripts/on_ask.ps1` | 确认通知(BurntToast) |
| `settings.hooks.patch.md` | 合并进 `~/.claude/settings.json` | Stop/Notification hook 片段(不含 secrets) |

## 部署步骤

1. **复制脚本** 到 `~/.claude/scripts/`。

2. **装 BurntToast**(若无):
   ```
   Install-Module BurntToast -Scope CurrentUser -Force
   ```

3. **合并通知 hook** 到 `~/.claude/settings.json`(见 `settings.hooks.patch.md`):
   - `hooks.Stop` 数组追加 command hook → `on_stop.ps1`
   - 新增 `hooks.Notification` → `on_ask.ps1`
   - **不动** env(secrets)和现有 http hooks

4. **装 caveman**(C1,可选):
   ```
   claude plugin marketplace add JuliusBrussee/caveman
   claude plugin install caveman@caveman
   ```

5. **接 rtk**(C2,可选,二进制需先装):
   ```
   rtk init -g --auto-patch
   ```
   - 加 rtk hook + 创建 RTK.md + CLAUDE.md 加 @RTK.md 引用

6. 重启 Claude Code 验证。

## 验证

| 项 | 方法 | 成功标准 |
|---|---|---|
| 完成通知 | AI 回复完成 | 弹 toast「Claude Code 对话完成」 |
| 确认通知 | 触发权限确认 | 弹 toast「需确认」 |
| caveman | 说 `/caveman` 或 `caveman mode` | 回复变 caveman 风格 |
| rtk | 跑 `git status` | 命令走 rtk 改写;`rtk gain` 有统计 |

## 与 opencode 的关键区别

Claude Code **有原生 `Stop`/`Notification` hook,同步执行,无超时坑** —— 直接 command hook 调脚本即可。opencode 的 plugin hook 有 ~1s 硬超时,通知只能靠 AI 自己跑 bash(详见 cache/opencode/*/NOTES.md)。Claude Code 简单得多。
