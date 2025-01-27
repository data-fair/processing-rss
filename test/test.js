process.env.NODE_ENV = 'test'
const config = require('config')
const assert = require('assert').strict
const rss = require('../')

describe('Hello world processing', () => {
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
        dataset: { title: 'test_rss' },
        url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
        clearFiles: false
      },
      tmpDir: 'data/'
    }, config, false)
    await rss.run(context)
  })
})
