# opencode.json patch 说明

> opencode.json 含 provider secrets,不入快照。此处只记录需要 patch 的字段。

## plugin 数组

在 `opencode.json` 顶层加 `plugin` 数组(若已有则追加):

```json
{
  "plugin": [
    "./plugins/caveman/plugin.js",
    "./plugins/notify/notify.ts"
  ]
}
```

注意:
- `rtk.ts` 在 `~/.config/opencode/plugins/` 顶层,靠 opencode 全局自动发现,**不需注册**
- `notify.ts` 在子目录 `plugins/notify/`,**必须显式注册**(子目录不被自动发现)
- caveman installer 会自动 patch caveman 的 plugin 条目 + 备份原文件为 `opencode.json.bak`

## 不动 provider

provider 配置(含 apiKey/baseURL)**不要动**。caveman installer 会备份原文件,但只首次;后续手动编辑注意保留。
