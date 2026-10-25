// Copy the pinned runtime into the build, not Git. No CDN is used at run time.
const fs = require('node:fs')
const path = require('node:path')
const source = path.dirname(require.resolve('pyodide/package.json'))
const target = path.resolve(__dirname, '../public/python-runtime')
fs.mkdirSync(target, { recursive: true })
const files = [
  'pyodide.mjs',
  'pyodide.asm.mjs',
  'pyodide.asm.wasm',
  'python_stdlib.zip',
  'pyodide-lock.json',
]
for (const name of files) {
  const input = path.join(source, name)
  if (!fs.existsSync(input)) throw new Error(`Missing Pyodide asset: ${name}. Run npm ci.`)
  if (fs.statSync(input).size > 25 * 1024 * 1024)
    throw new Error(`Runtime asset exceeds the Pages file limit: ${name}`)
  fs.copyFileSync(input, path.join(target, name))
}
console.log('Prepared self-hosted Python runtime from the pinned npm package.')
