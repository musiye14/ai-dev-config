<!-- dev-habit-pack-begin -->
# 开发习惯(dev-habit-pack)

## A1. 对话时间戳(硬要求)

每次完成一轮回复时,在该回复**正文第一行**输出时间戳徽章:

```
⏱ <HH:MM:SS> +08 · prev <N>s
```

- `<HH:MM:SS>`:你完成本条回复的**北京时间**(24 小时制)。本机时区已设为 UTC+8,`Get-Date -Format HH:mm:ss` 返回即北京时间,无需转换。
- `+08`:固定时区标识,表明这是北京时间。
- `<N>`:本轮耗时秒数(整数)= 从用户发出本轮首个 prompt 到你完成回复的墙钟时长。
- 时间戳行与回复正文之间空一行。

**例外**:单轮耗时 <2s 时不输出;用户说"安静"/"不输出时间"时本会话停用。

## A4. Skill 优先

有 skill 清单时,用户请求匹配某 skill 描述 → 优先调用 `skill` 工具加载,而不是凭记忆回答。
<!-- dev-habit-pack-end -->

> 注入位置:`~/.claude/CLAUDE.md`(追加,保留已有 `@RTK.md` 等引用,用 begin/end marker 包裹便于增删)。
> A2 子任务显示:Claude Code 已原生配置,跳过。
> A3 状态行:Claude 原生 `statusLine`(已有 statusline.sh),跳过。
