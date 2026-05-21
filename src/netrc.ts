import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

export interface NetrcEntry {
  machine: string
  login: string
  password: string
}

/**
 * Formats a single .netrc machine entry block.
 *
 * @param entry The entry to format.
 * @returns A formatted multi-line string block.
 */
export function formatNetrcEntry(entry: NetrcEntry): string {
  return `machine ${entry.machine}\n  login ${entry.login}\n  password ${entry.password}\n`
}

/**
 * Removes any existing entry for the given machine from raw .netrc content.
 *
 * A "machine" block spans from the `machine <host>` line up to (but not
 * including) the next `machine` or `default` keyword, or the end of file.
 *
 * @param content Raw text content of the .netrc file.
 * @param machine The hostname whose block should be removed.
 * @returns The content with the matching block removed.
 */
export function removeNetrcEntry(content: string, machine: string): string {
  if (!content) return content

  const lines = content.split('\n')
  const result: string[] = []
  let inTargetMachine = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('machine ')) {
      // Extract just the hostname token (first word after "machine ")
      const machineName = trimmed.slice('machine '.length).split(/\s/)[0]
      inTargetMachine = machineName === machine
    } else if (
      trimmed === 'default' ||
      trimmed.startsWith('default ') ||
      trimmed.startsWith('default\t')
    ) {
      inTargetMachine = false
    }

    if (!inTargetMachine) {
      result.push(line)
    }
  }

  return result.join('\n')
}

/**
 * Writes (or updates) a .netrc entry for the given machine.
 *
 * If a file already exists, any existing entry for the same machine is removed
 * and the new entry is appended.  Permissions are set to 0600 regardless of
 * whether the file was newly created or already existed.
 *
 * @param entry   The credentials to write.
 * @param netrcPath Override the default `$HOME/.netrc` path (useful for testing).
 * @returns The absolute path of the .netrc file that was written.
 */
export function writeNetrcEntry(entry: NetrcEntry, netrcPath?: string): string {
  const filePath = netrcPath ?? path.join(os.homedir(), '.netrc')

  let existingContent = ''
  if (fs.existsSync(filePath)) {
    existingContent = fs.readFileSync(filePath, 'utf8')
  }

  const cleaned = removeNetrcEntry(existingContent, entry.machine)
  const prefix = cleaned.trimEnd()
  const content = prefix
    ? prefix + '\n' + formatNetrcEntry(entry)
    : formatNetrcEntry(entry)

  // `mode` in writeFileSync only applies when creating a new file; chmodSync
  // ensures 0600 is enforced even when the file already exists.
  fs.writeFileSync(filePath, content, { mode: 0o600 })
  fs.chmodSync(filePath, 0o600)

  return filePath
}
