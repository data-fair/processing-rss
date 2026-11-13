import { strict as assert } from 'node:assert'
import { describe, it } from 'node:test'
import { dfRetry } from '../lib/retry.ts'

const warnings: string[] = []
const log: any = { warning: async (msg: string) => { warnings.push(msg) } }

const failing = (statuses: number[], shape: 'worker' | 'tests' = 'worker') => {
  let calls = 0
  const fn = async () => {
    const status = statuses[calls++]
    if (status === undefined) return 'ok'
    const err: any = new Error(`status ${status}`)
    if (shape === 'worker') err.response = { status }
    else err.status = status
    throw err
  }
  return { fn, calls: () => calls }
}

describe('dfRetry', () => {
  it('retries a 429 and rebuilds the request on each attempt', async () => {
    const { fn, calls } = failing([429, 429])
    assert.equal(await dfRetry(fn, log, { label: 'POST x', delayMs: 1 }), 'ok')
    assert.equal(calls(), 3)
    assert.match(warnings.at(-1)!, /POST x: data-fair answered 429/)
  })

  it('reads the status of a processing-dev error', async () => {
    const { fn, calls } = failing([503], 'tests')
    assert.equal(await dfRetry(fn, log, { label: 'PATCH x', delayMs: 1 }), 'ok')
    assert.equal(calls(), 2)
  })

  it('never replays a creation on a gateway error', async () => {
    const { fn, calls } = failing([502])
    await assert.rejects(() => dfRetry(fn, log, { label: 'POST x', creates: true, delayMs: 1 }), /status 502/)
    assert.equal(calls(), 1)
  })

  it('gives up after the last attempt', async () => {
    const { fn, calls } = failing([429, 429, 429, 429])
    await assert.rejects(() => dfRetry(fn, log, { label: 'POST x', delayMs: 1 }), /status 429/)
    assert.equal(calls(), 4)
  })

  it('rethrows other errors at once', async () => {
    const { fn, calls } = failing([400])
    await assert.rejects(() => dfRetry(fn, log, { label: 'POST x', delayMs: 1 }), /status 400/)
    assert.equal(calls(), 1)
  })
})
