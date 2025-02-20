import fs from 'fs-extra'
import path from 'path'
import util from 'util'
import FormData from 'form-data'
import { fetchRss } from './lib/fetchRss.js'
import { parseRss } from './lib/parseRss.js'
import { transformToCsv } from './lib/transform.js'
import type { ProcessingContext } from '@data-fair/lib-common-types/processings.js'

export const run = async ({ pluginConfig, processingConfig, processingId, dir, tmpDir, axios, log, patchConfig, ws, }: ProcessingContext) => {
  try {
    await log.info('Récupération du flux RSS...')
    const rssData = await fetchRss(processingConfig.url, axios)
    await log.info('Flux RSS récupéré.')

    await log.info('Parsing des données RSS...')
    const { items } = await parseRss(rssData)
    const csvData = transformToCsv(items)
    const fileNameCsv = `${processingConfig.dataset.title}-rss.csv`
    const outputFileCsv = path.join(tmpDir, fileNameCsv)

    await log.info('Écriture des données CSV dans un fichier...')
    await fs.ensureDir(tmpDir)
    await fs.writeFile(outputFileCsv, csvData)
    await log.info(`Fichier CSV généré : ${outputFileCsv}`)

    if (processingConfig.datasetMode === 'create') {
      const formData = new FormData()
      formData.append('title', processingConfig.dataset.title)
      formData.append('extras', JSON.stringify({ processingId }))
      formData.append('file', fs.createReadStream(outputFileCsv), { filename: fileNameCsv })
      const getFormDataLength = util.promisify(formData.getLength.bind(formData))
      const contentLength = await getFormDataLength()
      const dataset = (
        await axios({
          method: 'post',
          url: 'api/v1/datasets/',
          data: formData,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          headers: {
            ...formData.getHeaders(),
            'content-length': contentLength,
          },
        })
      ).data

      await log.info(`Jeu de données créé , id="${dataset.id}", title="${dataset.title}".`)
      await patchConfig({ datasetMode: 'update', dataset: { id: dataset.id, title: dataset.title } })
    } else if (processingConfig.datasetMode === 'update') {
      await log.step('Vérification du jeu de données')
      const datasetGet = (await axios.get(`api/v1/datasets/${processingConfig.dataset.id}`)).data
      if (!datasetGet) throw new Error(`Le jeu de données n'existe pas, id=${processingConfig.dataset.id}`)
      await log.info(`Le jeu de données existe, id="${datasetGet.id}", title="${datasetGet.title}"`)

      const formData = new FormData()
      formData.append('title', processingConfig.dataset.title)
      formData.append('extras', JSON.stringify({ processingId }))
      formData.append('file', fs.createReadStream(outputFileCsv), { filename: fileNameCsv })
      const getFormDataLength = util.promisify(formData.getLength.bind(formData))
      const contentLength = await getFormDataLength()

      const dataset = (
        await axios({
          method: 'post',
          url: `api/v1/datasets/${processingConfig.dataset.id}`,
          data: formData,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          headers: {
            ...formData.getHeaders(),
            'content-length': contentLength,
          },
        })
      ).data

      await log.info(`Jeu de données mis à jour, id="${dataset.id}", title="${dataset.title}".`)
    } else if (processingConfig.datasetMode === 'lines') {
      const formData = new FormData()
      formData.append('actions', fs.createReadStream(outputFileCsv), { filename: fileNameCsv })
      const getFormDataLength = util.promisify(formData.getLength.bind(formData))
      const contentLength = await getFormDataLength()
      const resultBulk = (
        await axios({
          method: 'post',
          url: `api/v1/datasets/${processingConfig.dataset.id}/_bulk_lines`,
          data: formData,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          headers: {
            ...formData.getHeaders(),
            'content-length': contentLength,
          },
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
  } catch (error: any) {
    await log.error('Erreur lors du traitement :', error.message || error)
    if (error.response) {
      await log.error('Réponse API :', error.response.status)
      await log.error('Détails de la réponse :', error.response.data)
    }
    await log.debug(error.stack)
  }
}
