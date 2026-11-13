import type { LogFunctions } from '@data-fair/lib-common-types/processings.js'

/** Status of an axios error, whatever its shape (worker: err.response, processing-dev: err.status). */
export const errorStatus = (err: any): number | undefined => err?.status ?? err?.response?.status

/** Body of an axios error, whatever its shape (worker: err.response.data, processing-dev: err.data). */
export const errorData = (err: any): any => err?.data ?? err?.response?.data

export interface RetryOptions {
  /** what is being sent, for the warning logged before each new attempt */
  label: string
  /**
   * A request that creates something is only retried on 429, which data-fair returns
   * before doing anything. A gateway error may hide a request that did go through, and
   * replaying a creation would then produce a duplicate.
   */
  creates?: boolean
  retries?: number
  delayMs?: number
}

const GATEWAY_STATUSES = [502, 503, 504]

/**
 * POST and PATCH requests to data-fair are not retried by the context's axios (only
 * idempotent methods are). Rate limits (429) and gateway errors during a long upload
 * would otherwise fail the whole run.
 *
 * `fn` is a thunk: a stream or FormData body can only be consumed once, so it must be
 * rebuilt on every attempt.
 */
export const dfRetry = async <T>(fn: () => Promise<T>, log: LogFunctions, opts: RetryOptions): Promise<T> => {
  const { label, creates = false, retries = 3, delayMs = 10000 } = opts
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn()
    } catch (err: any) {
      const status = errorStatus(err)
      const retryable = status === 429 || (!creates && status !== undefined && GATEWAY_STATUSES.includes(status))
      if (!retryable || attempt > retries) throw err
      const retryAfter = Number(err?.response?.headers?.['retry-after'] ?? err?.headers?.['retry-after'])
      const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : delayMs * attempt
      await log.warning(`${label}: data-fair answered ${status}, retrying in ${Math.round(delay / 1000)} s (attempt ${attempt}/${retries})`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}
