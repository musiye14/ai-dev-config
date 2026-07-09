import type { Plugin } from "@opencode-ai/plugin"
import { spawn, spawnSync } from "node:child_process"
import { homedir } from "node:os"
import { join } from "node:path"
import { appendFileSync } from "node:fs"

// dev-habit-pack — notification + timestamp-reinforcement plugin for opencode.
//
// What works (after extensive testing — see cache/.../NOTES.md):
//   - Completion toast: AI runs on_stop.ps1 via bash tool itself (rule in
//     system.transform). Plugin hooks can't fire it reliably — opencode
//     SIGTERMs spawnSync in event/tool hooks at ~1s, and detached/Start-Process
//     spawns get suppressed by WinRT. Only the bash tool path has no hard
//     timeout, so that's where the toast fires.
//   - Permission toast: permission.ask hook → fire on_ask.ps1 (detached).
//     This works because permission.ask isn't time-boxed like event hooks.
//   - Timestamp/subtask rule: system.transform appends every turn.
//
// Debug log: ~/.config/opencode/scripts/notify-debug.log

const SCRIPTS = join(homedir(), ".config", "opencode", "scripts")
const DEBUG_LOG = join(SCRIPTS, "notify-debug.log")

function dbg(msg: string) {
  try {
    const ts = new Date().toISOString()
    appendFileSync(DEBUG_LOG, `${ts} ${msg}\n`)
  } catch {}
}

const SHELL = (() => {
  for (const c of ["pwsh", "powershell"]) {
    try {
      const r = spawnSync(c, ["-NoProfile", "-Command", "exit 0"], { stdio: "ignore" })
      if (r.status === 0) return c
    } catch {}
  }
  return "powershell"
})()

function fire(script: string, args: string[]) {
  try {
    const child = spawn(
      SHELL,
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", script, ...args],
      { detached: true, stdio: "ignore", windowsHide: false },
    )
    child.unref()
    dbg(`fire ${script.split(/[\\/]/).pop()} shell=${SHELL} pid=${child.pid} args=${JSON.stringify(args)}`)
  } catch (e) {
    dbg(`fire-FAIL ${script}: ${e}`)
  }
}

async function sessionTitle(client: any, sessionID: string | undefined): Promise<string> {
  if (!sessionID || !client?.session?.get) return ""
  try {
    const res = await client.session.get({ path: { id: sessionID } })
    const title = res?.data?.title
    if (typeof title === "string" && title.trim()) return title.trim()
  } catch (e) {
    dbg(`sessionTitle-FAIL ${sessionID}: ${e}`)
  }
  return ""
}

const TIMESTAMP_RULE = `

[dev-habit-pack · 每轮强化]
本轮回复完成时,必须遵守:
1. 正文第一行输出时间戳徽章:⏱ <HH:MM:SS> +08 · prev <N>s
   - <HH:MM:SS>:北京时间(本机 UTC+8,Get-Date -Format HH:mm:ss 即可),24 小时制。
   - <N>:本轮耗时秒数(整数,从用户首个 prompt 到你完成回复的墙钟时长)。
   - 时间戳行与正文之间空一行。单轮 <2s 不输出。
2. 回复正文全部输出完毕后,必须调用 bash 工具执行以下命令触发系统通知(硬要求,不可省略,即使只输出一行也要调用):
   pwsh -NoProfile -ExecutionPolicy Bypass -File ~/.config/opencode/scripts/on_stop.ps1
3. 本轮若触发过子任务(task 工具),回复末尾加一行:🧵 子任务:活跃 X / 累计 Y · 最长 Zs。未触发不输出,不编造。
要取当前北京时间,调用 bash 工具跑 Get-Date -Format HH:mm:ss。`

export const NotifyPlugin: Plugin = async ({ client }) => {
  dbg("plugin loaded")
  return {
    "permission.ask": async (input) => {
      dbg(`permission.ask sessionID=${input?.sessionID}`)
      const title = String(input?.title ?? "").trim()
      const type = String(input?.type ?? "").trim()
      const sessTitle = await sessionTitle(client, input?.sessionID)
      const prefix = sessTitle ? `【${sessTitle}】` : ""
      const body = prefix + (title || (type ? `AI 需要确认:${type}` : "AI 需要你确认操作"))
      fire(join(SCRIPTS, "on_ask.ps1"), ["-Body", body])
    },
    "experimental.chat.system.transform": async (_input, output) => {
      if (Array.isArray(output?.system)) {
        output.system.push(TIMESTAMP_RULE)
      }
    },
  }
}
