import { describe, it } from 'node:test'
import ApiConfig from '../lib/config.js'
import { run } from '../index.js'
import assert from 'assert'

import processingConfigSchema from '../plugin-config-schema.json' assert { type: 'json' }
import pluginConfigSchema from '../plugin-config-schema.json' assert { type: 'json' }
const config = ApiConfig

describe('RSS processing', () => {
  it('should expose a plugin config schema for super admins', async () => {
    assert.ok(pluginConfigSchema)
  })

  it('should expose a processing config schema for users', async () => {
    assert.equal(processingConfigSchema.type, 'object')
  })

  it('should run a task', async function () {
    const testsUtils: any = await import('@data-fair/lib-processing-dev/tests-utils.js')
    const context = testsUtils.context({
      pluginConfig: {},
      processingConfig: {
        datasetMode: 'create',
        dataset: { title: 'Test create Rss' },
        url: 'https://news.un.org/feed/subscribe/fr/news/region/europe/feed/rss.xml'
      },
      tmpDir: 'data/'
    }, config, false)
    await run(context)
  })

  it('should run a task', async function () {
    const testsUtils: any = await import('@data-fair/lib-processing-dev/tests-utils.js')
    const context = testsUtils.context({
      pluginConfig: {},
      processingConfig: {
        datasetMode: 'update',
        dataset: { title: 'Test edit rss rss 1', id: 'ugrc593a0-ph7xfu9rkvjgvf' },
        url: 'https://news.un.org/feed/subscribe/fr/news/region/europe/feed/rss.xml'
      },
      tmpDir: 'data/'
    }, config, false)
    await run(context)
  })

  it('should run a task', async function () {
    const testsUtils: any = await import('@data-fair/lib-processing-dev/tests-utils.js')
    const context = testsUtils.context({
      pluginConfig: {},
      processingConfig: {
        datasetMode: 'lines',
        dataset: { title: 'Test_edit_rss', id: 'ehuai9zblhr2kmj4ag-mbq7o' },
        url: 'https://news.un.org/feed/subscribe/fr/news/region/europe/feed/rss.xml'
      },
      tmpDir: 'data/'
    }, config, false)
    await run(context)
  })

  it('should run a task', async function () {
    const testsUtils: any = await import('@data-fair/lib-processing-dev/tests-utils.js')
    const context = testsUtils.context({
      pluginConfig: {},
      processingConfig: {
        datasetMode: 'create',
        dataset: { title: 'test_rss_Poitiers' },
        url: 'https://www.grandpoitiers.fr/information-transversale/agenda/rss',
        clearFiles: false
      },
      tmpDir: 'data/'
    }, config, false)
    await run(context)
  })
})
