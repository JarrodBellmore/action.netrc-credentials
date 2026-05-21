import * as core from '@actions/core'
import { wait } from './wait.js'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.debug(`Waiting ${ms} milliseconds ...`)

    // Log the current timestamp, wait, then log the new timestamp
    const startTime = new Date().toTimeString()
    core.debug(startTime)
    await wait(parseInt(ms, 10))
    const endTime = new Date().toTimeString()
    core.debug(endTime)

    // Set outputs for other workflow steps to use
    core.setOutput('startTime', startTime)
    core.setOutput('endTime', endTime)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
