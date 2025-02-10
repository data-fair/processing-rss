process.env.NODE_ENV = 'test'
const config = require('config')
const assert = require('assert').strict
const rss = require('../')

describe ('RSS processing', () => {
  it ('should expose a plugin config schema for super admins', async () => {
    const schema = require('../plugin-config-schema.json')
    assert.ok(schema)
  })

  it ('should expose a processing config schema for users', async () => {
    const schema = require('../processing-config-schema.json')
    assert.equal(schema.type, 'object')
  })
it ('should run a task', async function () {
    this.timeout(1000000)

    const testsUtils = await import('@data-fair/lib-processing-dev/tests-utils.js')
    const context = testsUtils.context({
      pluginConfig: { },
      processingConfig: {
        datasetMode: 'create',
        dataset: { title: 'Test create Rss' },
        url: 'https://news.un.org/feed/subscribe/fr/news/region/europe/feed/rss.xml'
      },
      tmpDir: 'data/'
    }, config, false)
    await rss.run(context)
  })
it ('should run a task', async function () {
    this.timeout(1000000)

    const testsUtils = await import('@data-fair/lib-processing-dev/tests-utils.js')
    const context = testsUtils.context({
      pluginConfig: { },
      processingConfig: {
        datasetMode: 'update',
        dataset: { title: 'Test edit rss rss 1', id: 'ugrc593a0-ph7xfu9rkvjgvf' },
        url: 'https://news.un.org/feed/subscribe/fr/news/region/europe/feed/rss.xml'
      },
      tmpDir: 'data/'
    }, config, false)
    await rss.run(context)
  })
  it ('should run a task', async function () {
    this.timeout(1000000)

    const testsUtils = await import('@data-fair/lib-processing-dev/tests-utils.js')
    const context = testsUtils.context({
      pluginConfig: { },
      processingConfig: {
        datasetMode: 'lines',
        dataset: { title: 'Test_edit_rss', id: 'ehuai9zblhr2kmj4ag-mbq7o' },
        url: 'https://news.un.org/feed/subscribe/fr/news/region/europe/feed/rss.xml'
      },
      tmpDir: 'data/'
    }, config, false)
    await rss.run(context)
  })
  it ('should run a task', async function () {
    this.timeout(1000000)

    const testsUtils = await import('@data-fair/lib-processing-dev/tests-utils.js')
    const context = testsUtils.context({
      pluginConfig: { },
      processingConfig: {
        datasetMode: 'create',
        dataset: { title: 'test_rss_Poitiers' },
        url: 'https://www.grandpoitiers.fr/information-transversale/agenda/rss',
        clearFiles: false
      },
      tmpDir: 'data/'
    }, config, false)
    await rss.run(context)
  })
})
