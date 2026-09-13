import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const stylesDir = path.join(root, 'src', 'styles')
const srcDir = path.join(root, 'src')

function walk(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

const defined = new Set()
for (const file of fs.readdirSync(stylesDir)) {
  if (!file.endsWith('.css')) continue
  const css = fs.readFileSync(path.join(stylesDir, file), 'utf8')
  for (const m of css.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) defined.add(m[1])
}

const emitted = new Map()
function add(token, file) {
  if (!token) return
  if (!/^[a-z][\w-]*(__[\w-]+)?(--[\w-]+)?$/.test(token)) return
  if (!emitted.has(token)) emitted.set(token, file)
}

for (const file of walk(srcDir)) {
  if (!/\.(ts|tsx)$/.test(file)) continue
  const rel = path.relative(root, file).replace(/\\/g, '/')
  const text = fs.readFileSync(file, 'utf8')
  for (const m of text.matchAll(/className="([^"]+)"/g)) {
    for (const t of m[1].split(/\s+/)) add(t, rel)
  }
  for (const m of text.matchAll(/cn\(([^)]*)\)/g)) {
    for (const q of m[1].matchAll(/['"]([^'"]+)['"]/g)) {
      for (const t of q[1].split(/\s+/)) add(t, rel)
    }
  }
  for (const m of text.matchAll(/`([^`]*\$\{[^`]*)`/g)) {
    for (const t of m[1].split(/\s+/)) {
      if (t.includes('${')) continue
      add(t, rel)
    }
  }
}

const skip = new Set(['app', 'shell-cover', 'content-canvas'])
const missing = [...emitted.entries()]
  .filter(([token]) => !defined.has(token) && !skip.has(token))
  .sort((a, b) => a[0].localeCompare(b[0]))

console.log(`defined classes: ${defined.size}`)
console.log(`emitted classes: ${emitted.size}`)
console.log(`MISSING (${missing.length}):`)
for (const [token, file] of missing) console.log(`  ${token.padEnd(28)} ${file}`)
