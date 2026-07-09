# 部署笔记 · opencode 1.17.14

> 这些坑全部实测踩过。迁移时先读本文,避免重踩。

## 1. 通知:为什么用 AI bash 跑脚本,不用 plugin hook

### 失败方案(全部实测不行)

| 方案 | 机制 | 失败原因 |
|---|---|---|
| event hook `session.idle` → spawnSync 脚本 | plugin 监听完成事件 | opencode event hook 有硬超时(~1s),spawnSync 阻塞被 **SIGTERM** 杀,toast 没机会弹 |
| event hook → detached spawn | 非阻塞 spawn | WinRT/BurntToast 在 detached 进程被系统**抑制**,toast 不弹 |
| event hook → setImmediate 推迟 fire | hook 先 resolve,fire 下个 tick | hook resolve 后上下文清理,fire 仍被杀 |
| 自定义工具 `notify_done` → spawnSync | AI 调工具,execute 里 fire | **工具 execute 也有硬超时**,spawnSync 同样被 SIGTERM |
| 自定义工具 → detached spawn | 非阻塞 | 同 event hook,WinRT 抑制 detached 进程 |
| 自定义工具 → exec 内联命令 | node exec 非阻塞 | exec 回调没执行(toast 没弹),疑似上下文清理 |
| 脚本内 Start-Process 自我脱离 | 父秒退,子保活 | `-WindowStyle Hidden` 被 WinRT 抑制;`Normal` 也不弹(子进程被系统当后台) |

### 成功方案

**AI 用 bash 工具直接跑 `pwsh -File on_stop.ps1`**:
- bash 工具执行是 opencode 原生工具,**无硬超时限制**
- AI 在回复末尾跑这条命令 → 脚本同步跑 BurntToast → toast 弹
- 规则靠 `system.transform` 每轮强化(写进 system prompt)

### 根本原因

opencode 的 plugin hook(event / tool execute)都有硬超时(~1s),任何阻塞调用被 SIGTERM。而 WinRT toast 需要:
1. 调用进程保持存活 + 消息循环(同步 spawnSync 满足,但被超时杀)
2. 非 detached/非隐藏窗口(detached/Hidden 被 WinRT 抑制)

两个条件矛盾 → plugin hook 内无法可靠弹 toast。只有 bash 工具路径无超时限制,是唯一可靠方案。

### permission.ask 通知能用 hook

`permission.ask` hook → detached spawn on_ask.ps1 **能弹**。原因:permission.ask 不像 event/tool 那样硬超时,detached spawn 有时间让 Start-Process 子进程跑起来。但为保险,on_ask.ps1 仍用 Start-Process 自我脱离。

## 2. BurntToast 路径陷阱

- BurntToast 装在 **pwsh 7** 模块路径(`C:\Program Files\PowerShell\7\Modules`)
- `powershell.exe`(5.1)**找不到** BurntToast → `Import-Module` 失败
- 脚本/命令必须用 **pwsh** 跑,不能用 powershell.exe
- notify.ts 里 `SHELL` 探测优先 pwsh

## 3. pwsh 7 无 WinRT 投影

- pwsh 7 加载 `[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications]` 失败
- 报 `Operation is not supported on this platform`
- 只能用 BurntToast(它内部处理 WinRT 互操作),不能直接调 WinRT API
- powershell.exe(5.1)支持 `ContentType=WindowsRuntime` 语法,但没装 BurntToast

## 4. caveman installer bug

- `node caveman/bin/install.js --only opencode` 的 `stripOpencodeAgentTools` 没生效
- 三个 cavecrew agent 文件 frontmatter 残留 `tools: [Read, Grep, Bash]` 数组
- opencode 拒绝(要 object)→ 启动报 `Configuration is invalid`
- **手动删 `tools:` 行**,opencode fallback 默认工具集,agent body 自约束

## 5. 终端标题(无法同步)

- opencode **无终端标题配置项**(查过 config schema)
- opencode 自动生成会话标题(hidden `title` agent),显示在 TUI 侧边栏
- `client.session.get()` 可取标题,`client.session.update({body:{title}})` 可改名
- 但**不同步 OS 终端标题**(不像 Claude Code)—— plugin 跑在 server 进程,写不到 TUI 终端 stdout
- VSCode 多开区分:只能手动右键终端 tab → Rename,或看 TUI 侧边栏

## 6. session.idle 事件确实触发

- 日志确认 `session.idle` 在 AI 回复完成时**有触发**
- 但 plugin hook 内 fire 被 SIGTERM 杀,toast 不弹
- Esc 中断时反而能弹(走不同路径,hook 有时间跑完)
- 这曾导致误判:以为事件没触发,实际是 fire 被杀

## 7. 调试方法

- notify.ts 写 `~/.config/opencode/scripts/notify-debug.log`
- 记录:plugin loaded / event type / session.idle fired / fire pid+status+signal / toast cmd
- 排查顺序:看 `fire on_stop` 行的 `signal` 字段 → `SIGTERM` = 被超时杀;`pid` = detached 成功但不弹;`status=0` = 成功
