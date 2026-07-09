# 插件 / Skill 列表

> 每个条目 = 名字 + 类型 + GitHub + 安装命令 + 一句话说明。部署时 agent 读本表,按目标工具的安装方式去装(看 GitHub / 跑安装命令),**不把插件仓库搬进本项目**。
>
> 加新插件 = 在这里加一行。

## 条目

### caveman — 简洁模式

- **类型**: skill + plugin(动态模式切换靠 plugin/hook)
- **GitHub**: https://github.com/juliusbrussee/caveman
- **作用**: 让 agent 说话像 caveman,砍 ~65% output token,技术内容不变。默认 full,可切 lite/ultra/wenyan。说 "stop caveman" / "normal mode" 关闭。
- **安装**:
  - 通用(自动探测所有 agent):`curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash`(Windows: `irm .../install.ps1 | iex`)
  - Claude Code: `claude plugin marketplace add JuliusBrussee/caveman && claude plugin install caveman@caveman`
  - opencode: 官方仓库 `src/plugins/opencode/` 有专用 plugin,installer 自动落位到 `~/.config/opencode/plugins/caveman/`,并把规则块写进 AGENTS.md
  - 其它: `npx skills add JuliusBrussee/caveman -a <agent>`
- **验证**: flag 文件 `~/.config/opencode/.caveman-active` 存在即开启;`/caveman-stats` 看统计
- **注意**: opencode 官方路径是 plugin(session.created 写 flag + chat.message 解析命令 + system.transform 每轮强化)。纯 skill 也能用但失去动态切换,易漂移。

### rtk — 命令 token 优化

- **类型**: Rust 二进制 + plugin(命令改写)
- **GitHub**: https://github.com/rtk-ai/rtk
- **作用**: CLI 代理,自动把 bash 命令改写加 `rtk ` 前缀(`git status` → `rtk git status`),压缩输出省 60-90% token。透明,agent 无需手动加前缀。
- **安装**:
  1. 装二进制: `brew install rtk` / `cargo install --git https://github.com/rtk-ai/rtk` / 下载 release
  2. 装 agent 集成: `rtk init -g --opencode`(opencode plugin) / `rtk init -g`(Claude hook) / `rtk init -g --codex`
- **验证**: `rtk --version`;`rtk init --show` 看各 agent 安装状态;`rtk gain` 看节省统计
- **注意**: opencode 官方 plugin 调 `rtk rewrite <cmd>` 让 Rust 端 registry 决定改写,不硬编码命令列表。

---

## 通知脚本(必要脚本,搬进本项目)

有些功能必须本地脚本才能实现,这类才入库,放 `scripts/`。当前:

- `scripts/on_stop.ps1` — 对话轮结束弹 Win11 toast(BurntToast,缺失降级 MessageBox)
- `scripts/on_ask.ps1` — 需确认时弹 Win11 toast

各工具接线方式:
- **Claude Code**: `settings.json` 的 `Stop` / `Notification` hook 调脚本
- **Codex**: `hooks.json` 的 `Stop` / `PermissionRequest` hook 调脚本
- **opencode**: `permission.asked` 用插件调 `on_ask.ps1`;对话结束用 TUI 原生 `tui.json` 的 `attention`(无需脚本)

> 依赖:无。脚本用原生 WinRT toast API(Win10/11 自带),无需 BurntToast。WinRT 不可用时降级阻塞 MessageBox。
