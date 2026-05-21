/**
 * Unit tests for the action's main functionality, src/main.ts
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as core from '@actions/core'
import { wait } from '../src/wait.js'
import { run } from '../src/main.js'

vi.mock('@actions/core', () => ({
  debug: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  getInput: vi.fn(),
  setOutput: vi.fn(),
  setFailed: vi.fn(),
  warning: vi.fn()
}))

vi.mock('../src/wait.js', () => ({
  wait: vi.fn()
}))

describe('main.ts', () => {
  beforeEach(() => {
    // Set the action's inputs as return values from core.getInput().
    vi.mocked(core.getInput).mockImplementation(() => '500')

    // Mock the wait function so that it does not actually wait.
    vi.mocked(wait).mockImplementation(() => Promise.resolve('done!'))
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('Sets the startTime output', async () => {
    await run()

    // Verify the startTime output was set.
    expect(core.setOutput).toHaveBeenNthCalledWith(
      1,
      'startTime',
      // Simple regex to match a time string in the format HH:MM:SS.
      expect.stringMatching(/^\d{2}:\d{2}:\d{2}/)
    )
  })

  it('Sets the endTime output', async () => {
    await run()

    // Verify the endTime output was set.
    expect(core.setOutput).toHaveBeenNthCalledWith(
      2,
      'endTime',
      // Simple regex to match a time string in the format HH:MM:SS.
      expect.stringMatching(/^\d{2}:\d{2}:\d{2}/)
    )
  })

  it('Sets a failed status', async () => {
    // Clear the getInput mock and return an invalid value.
    vi.mocked(core.getInput)
      .mockClear()
      .mockReturnValueOnce('this is not a number')

    // Clear the wait mock and return a rejected promise.
    vi.mocked(wait)
      .mockClear()
      .mockRejectedValueOnce(new Error('milliseconds is not a number'))

    await run()

    // Verify that the action was marked as failed.
    expect(core.setFailed).toHaveBeenNthCalledWith(
      1,
      'milliseconds is not a number'
    )
  })
})
