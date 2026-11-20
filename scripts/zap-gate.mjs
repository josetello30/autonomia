// P3-61: resume el reporte JSON de OWASP ZAP y falla si hay alertas de riesgo alto.
// Uso: node scripts/zap-gate.mjs zap/reporte-zap.json
// Escribe el resumen en el log y, en GitHub Actions, en el resumen del job.

import { appendFileSync, readFileSync } from "node:fs"

const RISKS = { 3: "Alta", 2: "Media", 1: "Baja", 0: "Informativa" }
const report = JSON.parse(readFileSync(process.argv[2] ?? "zap/reporte-zap.json", "utf8"))
const alerts = (report.site ?? []).flatMap((site) => site.alerts ?? [])

const rows = alerts
  .map((a) => ({ risk: Number(a.riskcode), name: a.name, count: a.instances?.length ?? Number(a.count ?? 0) }))
  .sort((a, b) => b.risk - a.risk || a.name.localeCompare(b.name))
const totals = Object.fromEntries(Object.keys(RISKS).map((r) => [r, rows.filter((x) => x.risk === Number(r)).length]))

const lines = [
  "## OWASP ZAP (escaneo baseline)",
  "",
  `Alta: **${totals[3]}** · Media: ${totals[2]} · Baja: ${totals[1]} · Informativa: ${totals[0]}`,
  "",
  "| Riesgo | Alerta | Instancias |",
  "|---|---|---|",
  ...rows.map((r) => `| ${RISKS[r.risk]} | ${r.name} | ${r.count} |`),
  "",
  "El reporte completo (HTML, JSON y Markdown) está en los artefactos de esta ejecución.",
]
console.log(lines.join("\n"))
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join("\n") + "\n")

if (totals[3] > 0) {
  console.error(`\n${totals[3]} alerta(s) de riesgo alto: el escaneo falla.`)
  process.exit(1)
}
