/**
 * POST/PATCH requests to data-fair are not retried by the context axios (only idempotent methods are):
 * retry them on 429 and 5xx. The request is rebuilt by `fn` on each attempt (a form-data stream can only be read once).
 */
export const dfRetry = async <T>(fn: () => Promise<T>, log: { warning: (msg: string) => Promise<void> | void }, retries = 3, delayMs = 10000): Promise<T> => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn()
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status
      if (!(status === 429 || status >= 500) || attempt >= retries) throw err
      await log.warning(`Data-fair answered ${status}, pausing ${delayMs / 1000}s before retry ${attempt + 1}/${retries}`)
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
}
