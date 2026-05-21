/**
 * Unit tests for src/netrc.ts
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import {
  formatNetrcEntry,
  removeNetrcEntry,
  writeNetrcEntry,
  type NetrcEntry,
  type WriteNetrcResult
} from '../src/netrc.js'

vi.mock('node:fs')
vi.mock('node:os')

const FAKE_HOME = '/fake/home'
const FAKE_NETRC = path.join(FAKE_HOME, '.netrc')

describe('formatNetrcEntry', () => {
  it('formats a complete entry', () => {
    const entry: NetrcEntry = {
      machine: 'github.com',
      login: 'x-access-token',
      password: 'ghp_supersecret'
    }
    expect(formatNetrcEntry(entry)).toBe(
      'machine github.com\n  login x-access-token\n  password ghp_supersecret\n'
    )
  })
})

describe('removeNetrcEntry', () => {
  it('returns empty string unchanged', () => {
    expect(removeNetrcEntry('', 'github.com')).toBe('')
  })

  it('removes a multi-line machine block', () => {
    const content = [
      'machine github.com',
      '  login x-access-token',
      '  password old-token',
      ''
    ].join('\n')

    const result = removeNetrcEntry(content, 'github.com')
    expect(result).not.toContain('machine github.com')
    expect(result).not.toContain('old-token')
  })

  it('removes only the matching machine block, preserving others', () => {
    const content = [
      'machine github.com',
      '  login user1',
      '  password pass1',
      'machine gitlab.com',
      '  login user2',
      '  password pass2',
      ''
    ].join('\n')

    const result = removeNetrcEntry(content, 'github.com')
    expect(result).not.toContain('github.com')
    expect(result).not.toContain('pass1')
    expect(result).toContain('gitlab.com')
    expect(result).toContain('pass2')
  })

  it('leaves content untouched when machine is not present', () => {
    const content = 'machine gitlab.com\n  login user\n  password pass\n'
    const result = removeNetrcEntry(content, 'github.com')
    expect(result).toBe(content)
  })

  it('stops removing at a default block', () => {
    const content = [
      'machine github.com',
      '  login user',
      '  password pass',
      'default',
      '  login anon',
      ''
    ].join('\n')

    const result = removeNetrcEntry(content, 'github.com')
    expect(result).not.toContain('github.com')
    expect(result).toContain('default')
    expect(result).toContain('anon')
  })

  it('handles an inline-format machine entry', () => {
    const content = 'machine github.com login user password pass\n'
    const result = removeNetrcEntry(content, 'github.com')
    expect(result).not.toContain('github.com')
  })
})

describe('writeNetrcEntry', () => {
  beforeEach(() => {
    vi.mocked(os.homedir).mockReturnValue(FAKE_HOME)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('creates a new file when none exists', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    vi.mocked(fs.writeFileSync).mockReturnValue(undefined)
    vi.mocked(fs.chmodSync).mockReturnValue(undefined)

    const result: WriteNetrcResult = writeNetrcEntry({
      machine: 'github.com',
      login: 'x-access-token',
      password: 'token123'
    })

    expect(result.path).toBe(FAKE_NETRC)
    expect(result.contents).toBe(
      'machine github.com\n  login x-access-token\n  password token123\n'
    )
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      FAKE_NETRC,
      'machine github.com\n  login x-access-token\n  password token123\n',
      { mode: 0o600 }
    )
    expect(fs.chmodSync).toHaveBeenCalledWith(FAKE_NETRC, 0o600)
  })

  it('appends to an existing file with different machines', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(
      'machine gitlab.com\n  login user\n  password pass\n'
    )
    vi.mocked(fs.writeFileSync).mockReturnValue(undefined)
    vi.mocked(fs.chmodSync).mockReturnValue(undefined)

    const result = writeNetrcEntry({
      machine: 'github.com',
      login: 'x-access-token',
      password: 'newtoken'
    })

    expect(result.contents).toContain('gitlab.com')
    expect(result.contents).toContain('github.com')
    expect(result.contents).toContain('newtoken')
  })

  it('replaces an existing entry for the same machine', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(
      'machine github.com\n  login old-user\n  password old-token\n'
    )
    vi.mocked(fs.writeFileSync).mockReturnValue(undefined)
    vi.mocked(fs.chmodSync).mockReturnValue(undefined)

    const result = writeNetrcEntry({
      machine: 'github.com',
      login: 'x-access-token',
      password: 'new-token'
    })

    expect(result.contents).not.toContain('old-token')
    expect(result.contents).toContain('new-token')
    expect((result.contents.match(/machine github\.com/g) ?? []).length).toBe(1)
  })

  it('uses a custom netrc path when provided', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    vi.mocked(fs.writeFileSync).mockReturnValue(undefined)
    vi.mocked(fs.chmodSync).mockReturnValue(undefined)

    const customPath = '/custom/.netrc'
    const result = writeNetrcEntry(
      { machine: 'github.com', login: 'user', password: 'pass' },
      customPath
    )

    expect(result.path).toBe(customPath)
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      customPath,
      expect.any(String),
      { mode: 0o600 }
    )
  })
})
