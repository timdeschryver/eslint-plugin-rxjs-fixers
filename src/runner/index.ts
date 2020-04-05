import { readdirSync, lstatSync } from 'fs'
import { join, extname } from 'path'
import { execSync } from 'child_process'
import * as eslint from 'eslint'
import rxjsFixer from '../'

const deps = {
  eslint: require('eslint'),
  ['@typescript-eslint/parser']: require('@typescript-eslint/parser'),
}

// because eslint expects it to be installed locally
Object.entries(deps).forEach(([key, dep]) => {
  if (!dep) {
    console.log(`Installing ${key}`)
    execSync(`npm i ${key} --save-dev`)
  }
})

const extensions = ['.ts', '.js']
const ignore = ['node_modules', 'dist']

const engine = new eslint.CLIEngine({
  parser: '@typescript-eslint/parser',
  resolvePluginsRelativeTo: join(__dirname, '..', 'node_modules'),
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
  },
  extensions,
  plugins: ['rxjs-fixers-poc'],
  rulePaths: [join(__dirname, '..', 'rules')],
  rules: rxjsFixer.configs.all.rules,
  fix: true,
  useEslintrc: false, // don't use the eslintrc file in the existing project
})

const reports: [string, eslint.CLIEngine.LintReport][] = []

const cwd = process.cwd()
console.log(`Running in ${cwd}`)

for (const file of getFiles(cwd)) {
  console.log(`Linting ${file}`)
  const report = engine.executeOnFiles([file])
  eslint.CLIEngine.outputFixes(report)
  reports.push([file, report])
}

const touchedFiles = new Set(
  reports
    .map(([_, report]) =>
      report.results.filter((r) => !!r.output).map((r) => r.filePath),
    )
    .reduce((a, b) => [...a, ...b], []),
)

if (touchedFiles.size > 0) {
  console.log(`\r\n\r\nResults:\r\n`)
  touchedFiles.forEach((file) => console.log(`Modified ${file}`))
}

Object.entries(deps).forEach(([key, dep]) => {
  if (!dep) {
    console.log(`Removing ${key}`)
    execSync(`npm r ${key} --save-dev`)
  }
})

// counters doesn't go up?
// for (const [file, report] of reports) {
//   // if (report.errorCount || report.fixableErrorCount) {
//   //   console.log(
//   //     `Fixed ${report.errorCount} ${report.fixableErrorCount} in ${file}`,
//   //   )
//   // }
// }

function* getFiles(directory: string): IterableIterator<string> {
  if (ignore.some((i) => directory.includes(i))) return

  const directoryFiles = readdirSync(directory)
  for (const path of directoryFiles) {
    const file = join(directory, path)

    const pathIsDictionary = lstatSync(file).isDirectory()
    if (pathIsDictionary) {
      yield* getFiles(file)
    }

    const ext = extname(file)
    if (ext !== '.d.ts' && extensions.includes(ext)) {
      yield file
    }
  }
}
