const assert = require('node:assert/strict')
const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
const generated =
  /(^|\/)(node_modules|dist|python-runtime|test-results|playwright-report|coverage|\.wrangler|\.vscode|\.idea|tmp|temp)(\/|$)/i
const local =
  /(^|\/)(\.env(?:\..*)?|\.dev\.vars(?:\..*)?|\.DS_Store|Thumbs\.db|Desktop\.ini)$|\.(log|tsbuildinfo|bak|orig|rej)$/i
const privateKeys = /\.(pem|key|p12|pfx)$/i
const forbidden = tracked.filter(
  (file) => generated.test(file) || local.test(file) || privateKeys.test(file),
)
assert.deepEqual(
  forbidden,
  [],
  'Do not commit generated output, local settings, environment files or private keys.',
)

for (const directory of ['src/components', 'src/games', 'tests', 'scripts', 'docs', 'public/brand'])
  assert.ok(
    fs.statSync(path.join(root, directory)).isDirectory(),
    `Missing project folder: ${directory}`,
  )

const documents = [
  'README.md',
  'CONTRIBUTING.md',
  'docs/README.md',
  'docs/cloudflare.md',
  'docs/python.md',
  'THIRD_PARTY_NOTICES.md',
]
for (const file of documents) {
  const content = fs.readFileSync(path.join(root, file), 'utf8')
  const links = [...content.matchAll(/\]\(([^)\s]+)\)/g)].map((match) => match[1])
  for (const link of links) {
    if (/^(https?:|mailto:|#)/.test(link)) continue
    const target = decodeURIComponent(link.split('#')[0])
    assert.ok(
      fs.existsSync(path.resolve(root, path.dirname(file), target)),
      `${file}: missing local link ${link}`,
    )
  }
}
assert.ok(
  fs.existsSync(path.join(root, 'public/brand/geniuscode-logo.png')),
  'Official brand asset is missing.',
)
console.log(
  'Repository checks passed: tracked-file hygiene, organized test paths, documentation links and brand asset.',
)
