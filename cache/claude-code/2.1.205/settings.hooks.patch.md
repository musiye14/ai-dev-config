# settings.json 通知 hook 片段

> `~/.claude/settings.json` 含 secrets(ANTHROPIC_AUTH_TOKEN 等)+ 各类 http hooks,**不入快照**。
> 此处只记录需要合并的通知 hook 片段。合并时**保留现有 env 和 http hooks**。

## 1. `hooks.Stop` 数组追加(完成通知)

现有 Stop 通常已有一个 http hook(codemaker-managed)。**追加**一个 command 块,不替换:

```json
"Stop": [
  {
    "matcher": "*",
    "hooks": [
      { "type": "http", "url": "http://127.0.0.1:15721/hook/claude" }
    ]
  },
  {
    "matcher": "*",
    "hooks": [
      {
        "type": "command",
        "command": "pwsh -NoProfile -ExecutionPolicy Bypass -File C:/Users/<USER>/.claude/scripts/on_stop.ps1 -Title \"Claude Code 对话完成\""
      }
    ]
  }
]
```

## 2. 新增 `hooks.Notification`(确认通知)

```json
"Notification": [
  {
    "matcher": "*",
    "hooks": [
      {
        "type": "command",
        "command": "pwsh -NoProfile -ExecutionPolicy Bypass -File C:/Users/<USER>/.claude/scripts/on_ask.ps1 -Body \"Claude Code 需要你确认操作\""
      }
    ]
  }
]
```

## 注意

- 路径用**正斜杠**(避免 JSON 转义)。`<USER>` 替换为实际用户名(本机 `chenjiehao01.GAME`)。
- `-Title`/`-Body` 值里的引号在 JSON 中转义为 `\"`。
- 命令用 `pwsh`(非 `powershell.exe` 5.1)—— BurntToast 只在 pwsh 7 模块路径。
- 合并前**备份** settings.json。
- rtk init -g 也会改 settings.json(加 PreToolUse rtk hook),与本通知 hook 不冲突。
