const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const { loadPyodide } = require('pyodide')

require.extensions['.ts'] = (module, filename) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText,
    filename,
  )
const { missions, FREE_CODE, FREE_INPUT } = require('../src/games/python/missions.ts')
const { readNotebook, NOTEBOOK_KEY } = require('../src/games/python/notebook.ts')

;(async () => {
  const python = await loadPyodide({
    indexURL: path.dirname(require.resolve('pyodide/package.json')),
  })
  python.runPython(
    fs.readFileSync(path.resolve(__dirname, '../src/games/python/harness.py'), 'utf8'),
  )
  const execute = python.globals.get('run_student')
  const run = (code, input = '', check = '') => JSON.parse(execute(code, input, check))
  try {
    assert.equal(missions.length, 8)
    assert.equal(new Set(missions.map((item) => item.id)).size, 8)
    assert.equal(missions[0].topic, 'Strings & integers')
    assert.equal(missions[1].topic, 'Variables')
    assert.equal(
      run('print("Welcome!")\nprint("3")', '', missions[0].check).passed,
      false,
      'first mission must teach an integer, not a quoted number',
    )
    for (const mission of missions) {
      assert.equal(mission.starter, '', `${mission.id}: editor starts blank`)
      const solution = run(mission.solution, mission.inputs, mission.check)
      assert.equal(solution.error, '', `${mission.id}: ${solution.error}`)
      assert.equal(solution.passed, true, `${mission.id}: ${solution.feedback}`)
      assert.equal(
        run(mission.starter, mission.inputs, mission.check).passed,
        false,
        `${mission.id}: blank code must not pass`,
      )
    }
    assert.equal(FREE_CODE, '', 'free-code editor starts blank')
    assert.equal(FREE_INPUT, '', 'free-code input starts blank')
    const free = run(
      'name = input()\nprint("Hello,", name)\nfor colour in ["blue", "gold", "mint", "coral"]:\n    light(colour)',
      'Explorer',
    )
    assert.equal(free.error, '')
    assert.match(free.output, /Hello, Explorer/)
    assert.deepEqual(free.view.lights, ['blue', 'gold', 'mint', 'coral'])
    assert.equal(run('print(6 * 7)').output.trim(), '42', 'real Python arithmetic')
    assert.equal(run('print("你好, Python!")').output.trim(), '你好, Python!')
    assert.match(run('if True\n    print("oops")').error, /SyntaxError/)
    assert.match(run('name = input("Name? ")').error, /EOFError/)
    assert.match(run('while True:\n    print("too much")').error, /Output limit/)
    assert.match(run('for i in range(13):\n    light("gold")').error, /12 lanterns/)
    const cinema = missions.find((item) => item.id === 'cinema')
    assert.equal(
      run(
        'age = int(input())\nif age < 12:\n    price = 5\nelse:\n    price = 5',
        '9',
        cinema.check,
      ).passed,
      false,
      'cinema must validate adult and boundary cases too',
    )
    assert.equal(
      run('name = "<script>alert(1)</script>"\nprint(name)').view.name,
      '<script>alert(1)</script>',
      'output remains text, never HTML',
    )

    assert.deepEqual(readNotebook({ getItem: () => 'invalid JSON' }).completed, [])
    assert.deepEqual(
      readNotebook({
        getItem: () =>
          JSON.stringify({
            version: 1,
            completed: ['welcome', 'welcome', 'unknown', 'free'],
            drafts: {
              welcome: { code: 'print(42)', inputs: '' },
              free: { code: 'x'.repeat(20001), inputs: '' },
            },
          }),
      }),
      {
        version: 1,
        completed: ['welcome'],
        drafts: { welcome: { code: 'print(42)', inputs: '' } },
      },
    )
    assert.equal(NOTEBOOK_KEY, 'geniuscode.python-carnival.v1')
    console.log(
      'Python checks passed: blank mission/free-code defaults, all eight real-Python solutions, separate literal/variable lessons, course checks, input/output, errors, output bounds, lantern limits, boundary ages, Unicode, and versioned local drafts.',
    )
  } finally {
    execute.destroy()
  }
})().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
