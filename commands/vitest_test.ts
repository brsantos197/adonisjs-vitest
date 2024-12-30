import { args, BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { stubsRoot } from '../stubs/main.js'

export default class VitestCommand extends BaseCommand {
  static commandName = 'vitest:test'
  static description = 'Create a new Vitest test'

  static options: CommandOptions = {}

  @flags.string({ alias: 't', description: 'Type of the test' })
  declare type: string

  @args.string({ description: 'Name of the test' })
  declare name: string

  async run() {
    const allowedTypes = ['unit', 'integration', 'e2e']
    if (!this.type || !allowedTypes.includes(this.type)) {
      this.type = await this.prompt.choice('Select test type', ['unit', 'integration', 'e2e'])
    }

    const codemods = await this.createCodemods()
    await codemods.makeUsingStub(stubsRoot, `vitest_test.stub`, {
      name: this.name,
      type: this.type,
    })
  }
}
