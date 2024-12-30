import fs from 'node:fs'
/*
|--------------------------------------------------------------------------
| Configure hook
|--------------------------------------------------------------------------
|
| The configure hook is called when someone runs "node ace configure <package>"
| command. You are free to perform any operations inside this function to
| configure the package.
|
| To make things easier, you have access to the underlying "ConfigureCommand"
| instance and you can use codemods to modify the source files.
|
*/

import ConfigureCommand from '@adonisjs/core/commands/configure'
import { execSync } from 'node:child_process'

const configFileContent = `import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 30000, // Tempo limite para testes
    environmentMatchGlobs: [
      ['tests/unit/**', './tests/unit/setup.ts'],
      ['tests/integration/**', './tests/integration/setup.ts'],
      ['tests/e2e/**', './tests/e2e/setup.ts'],
    ],
    coverage: {
      include: ['app/**/*'],
      reporter: ['text', 'json', 'html'], // Opções de relatório de cobertura
    },
  },
})
`
const vitestSetupContent = (
  testType: string
) => `import type { Environment } from 'vitest/environments' with { 'resolution-mode': 'import' }

export default <Environment>{
  name: '${testType}',
  transformMode: 'ssr',
  setup() {
    return {
      async teardown() {},
    }
  },
}
`

export async function configure(command: ConfigureCommand) {
  let packageManager = 'npm'

  if (fs.existsSync('yarn.lock')) {
    packageManager = 'yarn'
  }

  if (fs.existsSync('pnpm-lock.yaml')) {
    packageManager = 'pnpm'
  }

  execSync(`${packageManager} install -D vitest @vitest/coverage-v8 @vitest/ui supertest`, {
    stdio: 'inherit',
  })
  if (!fs.existsSync('tests')) {
    fs.mkdirSync('tests')
  }
  ;['unit', 'integration', 'e2e'].forEach((testType) => {
    if (!fs.existsSync(`tests/${testType}`)) {
      fs.mkdirSync(`tests/${testType}`)
    }
    fs.writeFileSync(`tests/${testType}/setup.ts`, vitestSetupContent(testType))
  })
  fs.writeFileSync('vitest.config.ts', configFileContent)

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))

  const vitestScripts = {
    'test': 'vitest --run',
    'test:watch': 'vitest --watch',
    'test:unit': 'vitest --run --dir=tests/unit',
    'test:unit:watch': 'vitest --dir=tests/unit',
    'test:integration': 'vitest --run --dir=tests/integration',
    'test:integration:watch': 'vitest --dir=tests/integration',
    'test:e2e': 'vitest --run --dir=tests/e2e',
    'test:e2e:watch': 'vitest --dir=tests/e2e',
    'test:cov': 'vitest --coverage --run',
    'test:ui': 'vitest --ui',
  }

  packageJson.scripts = Object.assign(
    Object.fromEntries(
      Object.entries(packageJson.scripts)
        .filter(([key]) => !Object.keys(vitestScripts).includes(key))
        .sort()
    ),
    vitestScripts
  )

  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))

  const codemods = await command.createCodemods()
  await codemods.updateRcFile((rcFile) => {
    rcFile.addCommand('adonisjs-vitest/commands')
  })
}
