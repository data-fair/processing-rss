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
        dataset: { title: 'test_rss_le_Monde' },
        url: 'https://www.lemonde.fr/rss/une.xml',
        clearFiles: false
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
        dataset: { title: 'test_rss_Minist_Eco' },
        url: 'https://www.economie.gouv.fr/rss/toutesactualites',
        clearFiles: false
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
        dataset: { title: 'test_rss_ONU' },
        url: 'https://news.un.org/feed/subscribe/fr/news/region/europe/feed/rss.xml',
        clearFiles: false
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
        dataset: { title: 'test_rss_Banque_territoires' },
        url: 'https://www.banquedesterritoires.fr/flux/localtis.xml',
        clearFiles: false
      },
      tmpDir: 'data/'
    }, config, false)
    await rss.run(context)
  })
})
