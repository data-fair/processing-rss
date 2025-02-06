const fs = require('fs-extra')
const path = require('path')
const util = require('util')
const FormData = require('form-data')
const { fetchRss } = require('./lib/fetchRss')
const { parseRss } = require('./lib/parseRss')
const { transformToCsv } = require('./lib/transform')
const config = require('config')

exports.run = async ({ pluginConfig, processingConfig, processingId, dir, tmpDir, axios, log, patchConfig, ws }) => {
  try {
    log.info('Récupération du flux RSS...')
    const rssData = await fetchRss(processingConfig.url)
    log.info('Flux RSS récupéré.')

    log.info('Parsing des données RSS...')
    const { items } = await parseRss(rssData)
    const csvData = transformToCsv(items)
    const fileNameCsv = processingConfig.dataset.title + '-rss.csv'
    const outputFileCsv = path.join(tmpDir, fileNameCsv)

    log.info('Écriture des données CSV dans un fichier...')
    await fs.ensureDir(tmpDir)
    await fs.writeFile(outputFileCsv, csvData)
    log.info(`Fichier CSV généré : ${outputFileCsv}`)

    if (processingConfig.datasetMode === 'create') {
      const formData = new FormData()
      formData.append('title', processingConfig.dataset.title)
      formData.append('extras', JSON.stringify({ processingId }))
      formData.append('file', fs.createReadStream(outputFileCsv), { filename: fileNameCsv })
      formData.getLength = util.promisify(formData.getLength)
      const dataset = (
        await axios({
          method: 'post',
          url: config.dataFairUrl + 'api/v1/datasets/',
          data: formData,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          headers: {
            ...formData.getHeaders(),
            'x-apiKey': config.dataFairAPIKey,
            'content-length': await formData.getLength()
          }
        })
      ).data

      log.info(
        `Jeu de données créé , id="${dataset.id}", title="${dataset.title}".`
      )
      await patchConfig({ datasetMode: 'update', dataset: { id: dataset.id, title: dataset.title } })
    } else if (processingConfig.datasetMode === 'update') {
      await log.step('Vérification du jeu de données')
      const datasetGet = (await axios.get(`${config.dataFairUrl}api/v1/datasets/${processingConfig.dataset.id}`)).data
      if (!datasetGet) throw new Error(`Le jeu de données n'existe pas, id=${processingConfig.dataset.id}`)
      await log.info(`Le jeu de données existe, id="${datasetGet.id}", title="${datasetGet.title}"`)
      const formData = new FormData()
      formData.append('title', processingConfig.dataset.title)
      formData.append('extras', JSON.stringify({ processingId }))
      formData.append('file', fs.createReadStream(outputFileCsv), { filename: fileNameCsv })
      formData.getLength = util.promisify(formData.getLength)
      const dataset = (
        await axios({
          method: 'post',
          url: config.dataFairUrl + 'api/v1/datasets/' + processingConfig.dataset.id,
          data: formData,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          headers: {
            ...formData.getHeaders(),
            'x-apiKey': config.dataFairAPIKey,
            'content-length': await formData.getLength()
          }
        })
      ).data

      log.info(
        `Jeu de données mis à jour, id="${dataset.id}", title="${dataset.title}".`
      )
    } else if (processingConfig.datasetMode === 'lines') {
      const formData = new FormData()
      formData.append('actions', fs.createReadStream(outputFileCsv), { filename: fileNameCsv })
      formData.getLength = util.promisify(formData.getLength)
      const resultBulk = (
        await axios({
          method: 'post',
          url: `${config.dataFairUrl}api/v1/datasets/${processingConfig.dataset.id}/_bulk_lines`,
          data: formData,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          headers: {
            ...formData.getHeaders(),
            'x-apiKey': config.dataFairAPIKey,
            'content-length': await formData.getLength()
          }
        })
      ).data

      await log.info(`lignes chargées: ${resultBulk.nbOk.toLocaleString()} ok, ${resultBulk.nbNotModified.toLocaleString()} sans modification, ${resultBulk.nbErrors.toLocaleString()} en erreur`)
      if (resultBulk.nbErrors) {
        await log.error(`${resultBulk.nbErrors} erreurs rencontrées`)
        for (const error of resultBulk.errors) {
          await log.error(JSON.stringify(error))
        }
      }
    }
  } catch (error) {
    log.error('Erreur lors du traitement :', error.message || error)
    if (error.response) {
      log.error('Réponse API :', error.response.status, error.response.statusText)
      log.error('Détails de la réponse :', error.response.data)
    }
    log.debug(error.stack)
  }
}
