/**
 * runCommand.ts — Safe command runner (V8 / T5, Q2).
 *
 * A thin, Promise-friendly wrapper around `child_process.execFile`. It accepts
 * ONLY a command + an argument array and NEVER a shell string, so there is no
 * path for shell injection of user input. The caller is responsible for
 * validating every argument beforehand (see `commandWhitelist.ts`).
 *
 * NOTE: `execFile` does not spawn a shell, so metacharacters in `args` are
 * passed verbatim to the target program — exactly what we want.
 */

import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

/** Result returned by every command execution. */
export interface CommandResult {
  stdout: string;
  stderr: string;
  /** Process exit code. `0` means success. Non-zero otherwise. */
  code: number;
}

/** Default safety limits for a single service command. */
const COMMAND_TIMEOUT_MS = 120_000;
const COMMAND_MAX_BUFFER = 10 * 1024 * 1024; // 10 MiB

/**
 * Execute `cmd` with `args` (no shell). Resolves with stdout/stderr/code.
 *
 * Even when the underlying process exits non-zero or times out, we resolve
 * (never reject) so callers can surface the failure in the API response. The
 * `code` field communicates success/failure; timeouts are reported as `124`
 * (the conventional "timeout" exit code).
 */
export async function runCommand(cmd: string, args: string[] = []): Promise<CommandResult> {
  try {
    const { stdout, stderr } = await execFileAsync(cmd, args, {
      timeout: COMMAND_TIMEOUT_MS,
      maxBuffer: COMMAND_MAX_BUFFER,
      windowsHide: true,
    });
    return {
      stdout: stdout.toString(),
      stderr: stderr.toString(),
      code: 0,
    };
  } catch (err) {
    const e = err as NodeJS.ErrnoException & {
      stdout?: string;
      stderr?: string;
      code?: number | string;
      killed?: boolean;
    };
    const stdout = typeof e.stdout === 'string' ? e.stdout : '';
    // If there is no captured stderr, fall back to the error message so the
    // operator still sees *why* it failed.
    const stderr = typeof e.stderr === 'string' && e.stderr.length > 0
      ? e.stderr
      : (e.message || 'Unknown error');

    let code: number;
    if (typeof e.code === 'number') {
      code = e.code;
    } else if (e.killed) {
      code = 124; // timed out
    } else {
      code = 1;
    }

    return { stdout, stderr, code };
  }
}
