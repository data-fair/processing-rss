import { strict as assert } from 'node:assert'
import { it, describe, before, after } from 'node:test'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import type { AddressInfo } from 'node:net'
import { parseRss } from '../lib/parseRss.ts'
import { transformToCsv } from '../lib/transform.ts'

import processingConfigSchema from '../processing-config-schema.json' with { type: 'json' }

const fixturesDir = path.join(import.meta.dirname, 'fixtures')
const readFixture = (name: string) => fs.readFileSync(path.join(fixturesDir, name), 'utf8')
const csvHeader = '"title","link","datePublication","description","image"'

describe('RSS processing', () => {
  // Each plugin should expose a processing config schema
  it('should expose a processing config schema for users', async () => {
    assert.equal(processingConfigSchema.type, 'object')
  })

  it('should convert an RSS feed to CSV', async () => {
    const csv = transformToCsv(await parseRss(readFixture('feed.rss'), 'rss'), 'rss')
    assert.deepEqual(csv.split('\n'), [
      csvHeader,
      '"First item","http://example.com/1","2003-06-10T04:00:00.000Z","Hello [world](http://example.com)","http://example.com/1.jpg"',
      '"Second item","http://example.com/2","Format Date non valide","Pas de description disponible.","http://example.com/2.jpg"'
    ])
  })

  it('should convert an Atom feed to CSV', async () => {
    const csv = transformToCsv(await parseRss(readFixture('feed.atom'), 'atom'), 'atom')
    assert.deepEqual(csv.split('\n'), [
      csvHeader,
      '"First entry","http://example.com/a","2024-01-02T03:04:05.000Z","An **html** summary","Pas d\'image disponible"',
      '"Second entry","http://example.com/b","Format Date non valide","Pas de description disponible.","Pas d\'image disponible"'
    ])
  })

  // runs against a real data-fair instance, needs config/local-test.mjs (dataFairUrl, dataFairAPIKey)
  const hasLocalConfig = fs.existsSync(path.join(import.meta.dirname, '../config/local-test.mjs'))
  describe('run against data-fair', { skip: !hasLocalConfig && 'config/local-test.mjs is missing' }, () => {
    const server = http.createServer((req, res) => {
      fs.createReadStream(path.join(fixturesDir, path.basename(req.url!)))
        .on('error', () => res.writeHead(404).end())
        .pipe(res)
    })
    let baseUrl: string
    let axios: any
    const createdIds: string[] = []

    before(async () => {
      await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
      baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
    })

    after(async () => {
      server.close()
      for (const id of createdIds) await axios.delete(`api/v1/datasets/${id}`)
    })

    for (const type of ['rss', 'atom']) {
      it(`should create then update a dataset from an ${type} feed`, async () => {
        const config = (await import('#config')).default
        const testUtils = (await import('@data-fair/lib-processing-dev/tests-utils.js')).default
        const rssPlugin = await import('../index.ts')
        const context = testUtils.context({
          processingConfig: {
            datasetMode: 'create',
            dataset: { title: `Test processing-rss ${type}` },
            url: `${baseUrl}/feed.${type}`,
            type
          },
          tmpDir: 'data/'
        }, config, false)
        axios = context.axios

        await rssPlugin.run(context)
        assert.equal(context.processingConfig.datasetMode, 'update')
        const datasetId = context.processingConfig.dataset.id
        createdIds.push(datasetId)
        await context.ws.waitForJournal(datasetId, 'finalize-end')

        await rssPlugin.run(context)
        await context.ws.waitForJournal(datasetId, 'finalize-end')
        const lines = (await axios.get(`api/v1/datasets/${datasetId}/lines`)).data
        assert.equal(lines.total, 2)
      })
    }
  })
})
