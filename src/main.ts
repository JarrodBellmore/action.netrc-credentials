import * as core from '@actions/core'
import { writeNetrcEntry } from './netrc.js'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const machine = core.getInput('machine', { required: true })
    const login = core.getInput('login', { required: true })
    const password = core.getInput('password', { required: true })

    core.debug(`Writing .netrc entry for machine: ${machine}`)

    const netrcPath = writeNetrcEntry({ machine, login, password })

    core.info(`Wrote .netrc entry for ${machine} to ${netrcPath}`)
    core.setOutput('netrc-path', netrcPath)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
