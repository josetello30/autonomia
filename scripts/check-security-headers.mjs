// P3-61: comprueba que cada URL responde con las cabeceras de seguridad exigidas.
// Uso: node scripts/check-security-headers.mjs https://sitio/ https://sitio/descargar
// Sale con código 1 si alguna falta o es más débil de lo esperado.

const checks = {
  "content-security-policy": (v) =>
    ["default-src 'self'", "object-src 'none'", "frame-ancestors 'none'", "base-uri 'self'"]
      .filter((d) => !v.includes(d))
      .map((d) => `falta «${d}»`),
  "strict-transport-security": (v) => {
    const maxAge = Number(/max-age=(\d+)/.exec(v)?.[1] ?? 0)
    return maxAge >= 31536000 ? [] : [`max-age ${maxAge} < 1 año`]
  },
  "x-content-type-options": (v) => (v.toLowerCase() === "nosniff" ? [] : ["debe ser nosniff"]),
  "referrer-policy": (v) =>
    ["no-referrer", "strict-origin", "strict-origin-when-cross-origin", "same-origin"].includes(v)
      ? []
      : [`valor débil: ${v}`],
  "permissions-policy": (v) => (v.includes("camera=(self)") ? [] : ["la cámara debe ser camera=(self)"]),
}

const urls = process.argv.slice(2)
if (urls.length === 0) {
  console.error("Uso: node scripts/check-security-headers.mjs <url> [url...]")
  process.exit(2)
}

let failures = 0
for (const url of urls) {
  const response = await fetch(url, { redirect: "manual" })
  console.log(`\n${url} → ${response.status}`)
  for (const [name, check] of Object.entries(checks)) {
    const value = response.headers.get(name)
    const problems = value === null ? ["no está"] : check(value)
    failures += problems.length
    console.log(`  ${problems.length ? "✗" : "✓"} ${name}${problems.length ? ": " + problems.join("; ") : ""}`)
  }
  if (response.headers.get("x-powered-by")) {
    failures += 1
    console.log(`  ✗ x-powered-by no debería enviarse (${response.headers.get("x-powered-by")})`)
  }
}

if (failures) {
  console.error(`\n${failures} problema(s) en las cabeceras de seguridad.`)
  process.exit(1)
}
console.log("\nTodas las cabeceras de seguridad están presentes.")
