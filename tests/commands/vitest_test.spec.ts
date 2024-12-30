import { AceFactory } from '@adonisjs/core/factories'
import { test } from '@japa/runner'
import VitestCommand from '../../commands/vitest_test.js'

test.group('Vitest Test', (group) => {
  group.each.teardown(async () => {
    delete process.env.ADONIS_ACE_CWD
  })
  test('create a new vitest test', async ({ fs, assert }) => {
    const ace = await new AceFactory().make(fs.baseUrl)
    await ace.app.init()
    ace.ui.switchMode('raw')

    const command = await ace.create(VitestCommand, ['Todo', '--type=unit'])
    await command.exec()
    command.assertLog('green(DONE:)    create tests/unit/todo.spec.ts')
    await assert.fileContains('tests/unit/todo.spec.ts', "import { describe, it } from 'vitest'")
  })
})
