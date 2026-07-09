# dev-habit-pack

跨终端 Coding Agent 的开发习惯配置包。四件套,极简。

## 结构

```
dev-habit-pack/
├── features.md    # 功能列表:工具无关的开发习惯(时间戳/通知/子任务…)。注入 agent 的 instructions 文件。
├── registry.md    # 插件/skill 列表:名字 + GitHub + 安装命令。agent 读表自己去装,不搬仓库。
├── scripts/       # 仅"实现功能必需"的脚本(通知 on_ask/on_stop.ps1)。非必要不入。
└── cache/         # 用户确认可靠后的部署快照,按 <tool>/<ver>/ 存。迁移时命中直接复制。
```

## 思路

- **加新习惯** → 改 `features.md`(工具无关规则)或 `registry.md`(加一行插件)。
- **部署到某工具** → 先查 `cache/<tool>/<ver>/`:
  - **命中** → 直接复制过去,收工。
  - **没命中** → 读 `features.md` 生成 instructions 规则文件;读 `registry.md` 逐条按目标工具方式安装插件(agent 看 GitHub / 跑安装命令);必要脚本从 `scripts/` 拿。
- **确认可靠** → 存快照进 `cache/`,下次同版本命中即取。
- 外部插件(caveman/rtk 等)**不搬仓库**,registry 里记一行链接 + 安装命令,agent 自己去装。只有实现功能必需的脚本才入 `scripts/`。

## 给被派来部署的 agent

1. 读 `features.md` + `registry.md`。
2. 查 `cache/<tool>/<ver>/` 是否命中 → 命中就复制。
3. 没命中:探查工具能力(hook/statusLine/skill 目录/instructions 文件),按 features 落规则、按 registry 装插件。工具做不到的能力就豁免,不硬塞降级。
4. 部署完让用户验证,可靠后存 `cache/<tool>/<ver>/`。

已验证快照:`cache/opencode/1.17.14/`(含 MANIFEST.md 迁移步骤 + NOTES.md 踩坑笔记)。
