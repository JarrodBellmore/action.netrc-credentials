/**
 * Unit tests for the action's main functionality, src/main.ts
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as core from '@actions/core'
import * as netrc from '../src/netrc.js'
import { run } from '../src/main.js'

vi.mock('@actions/core', () => ({
  debug: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  getInput: vi.fn(),
  setOutput: vi.fn(),
  setFailed: vi.fn(),
  setSecret: vi.fn(),
  warning: vi.fn()
}))

vi.mock('../src/netrc.js', () => ({
  writeNetrcEntry: vi.fn()
}))

describe('main.ts', () => {
  beforeEach(() => {
    vi.mocked(core.getInput).mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        machine: 'github.com',
        login: 'x-access-token',
        password: 'ghp_testtoken'
      }
      return inputs[name] ?? ''
    })

    vi.mocked(netrc.writeNetrcEntry).mockReturnValue({
      path: '/home/runner/.netrc',
      contents:
        'machine github.com\n  login x-access-token\n  password ghp_testtoken\n'
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('calls writeNetrcEntry with the correct inputs', async () => {
    await run()

    expect(netrc.writeNetrcEntry).toHaveBeenCalledWith({
      machine: 'github.com',
      login: 'x-access-token',
      password: 'ghp_testtoken'
    })
  })

  it('sets the netrc-path output', async () => {
    await run()

    expect(core.setOutput).toHaveBeenCalledWith(
      'netrc-path',
      '/home/runner/.netrc'
    )
  })

  it('sets the netrc-contents output', async () => {
    await run()

    expect(core.setOutput).toHaveBeenCalledWith(
      'netrc-contents',
      'machine github.com\n  login x-access-token\n  password ghp_testtoken\n'
    )
  })

  it('masks the password with setSecret', async () => {
    await run()

    expect(core.setSecret).toHaveBeenCalledWith('ghp_testtoken')
  })

  it('logs an info message with the machine and path', async () => {
    await run()

    expect(core.info).toHaveBeenCalledWith(
      'Wrote .netrc entry for github.com to /home/runner/.netrc'
    )
  })

  it('calls setFailed when writeNetrcEntry throws', async () => {
    vi.mocked(netrc.writeNetrcEntry).mockImplementation(() => {
      throw new Error('permission denied')
    })

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('permission denied')
  })
})
