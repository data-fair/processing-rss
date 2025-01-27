const fs = require('fs-extra')
const path = require('path')
const util = require('util')
const FormData = require('form-data')
const { fetchRss } = require('./lib/fetchRss')
const { parseRss } = require('./lib/parseRss')
const { stringify } = require('csv-stringify/sync')
const config = require('config')

exports.run = async ({ pluginConfig, processingConfig, processingId, dir, tmpDir, axios, log, patchConfig, ws }) => {
  try {
    log.info('Récupération du flux RSS...')
    const rssData = await fetchRss(processingConfig.url)
    log.info('Flux RSS récupéré.')

    log.info('Parsing du flux RSS...')
    const parsedData = await parseRss(rssData)

    // Extraire les données des items
    const items = parsedData.rss.channel.item || []
    if (!Array.isArray(items)) {
      throw new Error('Le format des items du flux RSS est invalide.')
    }

    log.info('Transformation des données en CSV...')
    const csvData = stringify(items, {
      header: true,
      columns: Object.keys(items[0])
    })
    const fileName = processingConfig.dataset.title + '-rss.csv'
    const outputFile = path.join(tmpDir, fileName)
    log.info('Écriture des données CSV dans un fichier...')
    await fs.ensureDir(tmpDir)
    await fs.writeFile(outputFile, csvData)

    log.info(`Fichier CSV généré : ${outputFile}`)

    const formData = new FormData()
    formData.append('title', processingConfig.dataset.title)
    formData.append('extras', JSON.stringify({ processingId }))
    formData.append('file', fs.createReadStream(outputFile), { outputFile })
    formData.getLength = util.promisify(formData.getLength)

    log.info('En-têtes de FormData:', formData.getHeaders())

    log.info('Envoi des données à l\'API DataFair...')
    const dataset = (
      await axios({
        method: 'post',
        url: config.dataFairUrl + 'api/v1/datasets/' + (processingConfig.dataset.id || ''),
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

    log.info('Données envoyées avec succès.')
    log.info(
      `Jeu de données ${
        processingConfig.datasetMode === 'update' ? 'mis à jour' : 'créé'
      }, id="${dataset.id}", title="${dataset.title}".`
    )

    // Mise à jour de la configuration si nécessaire
    if (processingConfig.datasetMode === 'create') {
      await patchConfig({
        datasetMode: 'update',
        dataset: { id: dataset.id, title: dataset.title }
      })
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
