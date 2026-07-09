<!-- dev-habit-pack-begin -->
# 开发习惯(dev-habit-pack · opencode 适配)

工具无关开发习惯,部署到 opencode。§3 状态行对 opencode 豁免(opencode TUI 无可脚本化状态行,不硬注入终端标题)。

## 1. 对话时间戳(硬要求)

每次完成一轮回复时,在该回复**正文第一行**输出时间戳徽章:

```
⏱ <HH:MM:SS> +08 · prev <N>s
```

- `<HH:MM:SS>`:你完成本条回复的**北京时间**(24 小时制)。本机时区已设为 UTC+8,`Get-Date -Format HH:mm:ss` 返回即北京时间,无需转换。
- `+08`:固定时区标识,表明这是北京时间。
- `<N>`:本轮耗时秒数(整数)= 从用户发出本轮首个 prompt 到你完成回复的墙钟时长。
- 时间戳行与回复正文之间空一行。

**例外**:单轮耗时 <2s 时不输出;用户说"安静"/"不输出时间"时本会话停用。

**为什么靠 AI 自输出**:TUI 是编译二进制,无法在消息流插入时间戳。AI 自输出是唯一跨工具一致的实现。

## 2. 子任务显示

opencode 不原生显示活跃子任务数。本轮**确实触发过**子任务(task 工具)→ 回复末尾加一行:`🧵 子任务:活跃 X / 累计 Y · 最长 Zs`。

未触发子任务不输出。不编造数字。

## 3. 状态行(豁免)

opencode TUI 无可脚本化状态行 → 放弃,不硬注入终端标题。本节不执行。

## 4. 系统通知

对话轮结束:AI 回复正文输出完毕后,必须用 bash 工具跑 `pwsh -NoProfile -ExecutionPolicy Bypass -File ~/.config/opencode/scripts/on_stop.ps1` 触发 Win11 toast(硬要求,不可省略)。
需确认操作:由 notify 插件监听 `permission.ask` 自动调 `on_ask.ps1` 弹 toast。
AI **无需**调用工具发确认通知(自动),但**必须**主动跑 on_stop.ps1 发完成通知。

## 5. Skill 优先

有 skill 清单时,用户请求匹配某 skill 描述 → 优先调用 `skill` 工具加载,而不是凭记忆回答。
<!-- dev-habit-pack-end -->
