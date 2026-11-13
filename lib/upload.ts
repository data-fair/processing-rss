import type { ProcessingContext } from '@data-fair/lib-common-types/processings.js'
import type { ProcessingConfig } from '#types/processingConfig/index.ts'
import fs from 'fs-extra'
import FormData from 'form-data'
import { dfRetry } from './utils.ts'

/**
 * POST a multipart form built by `fill` on each attempt (a file stream can only be read once).
 */
const postForm = async (
  { axios, log }: ProcessingContext<ProcessingConfig>,
  url: string,
  fill: (formData: FormData) => void
) => {
  return (await dfRetry(async () => {
    const formData = new FormData()
    fill(formData)
    const contentLength = await new Promise<number>((resolve, reject) => {
      formData.getLength((err, length) => err ? reject(err) : resolve(length))
    })
    return axios({
      method: 'post',
      url,
      data: formData,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      headers: {
        ...formData.getHeaders(),
        'content-length': contentLength
      }
    })
  }, log)).data
}

const upload = async (context: ProcessingContext<ProcessingConfig>, outputFileCsv: string) => {
  const { processingConfig, processingId, axios, log, patchConfig } = context
  const fileNameCsv = `${processingConfig.dataset.title}-rss.csv`

  if (processingConfig.datasetMode === 'create') {
    const dataset = await postForm(context, 'api/v1/datasets/', (formData) => {
      formData.append('title', processingConfig.dataset.title)
      formData.append('extras', JSON.stringify({ processingId }))
      formData.append('file', fs.createReadStream(outputFileCsv), { filename: fileNameCsv })
    })
    await log.info(`Jeu de données créé , id="${dataset.id}", title="${dataset.title}".`)
    await patchConfig({ datasetMode: 'update', dataset: { id: dataset.id, title: dataset.title } })
  } else if (processingConfig.datasetMode === 'update') {
    await log.step('Vérification du jeu de données')
    const datasetGet = (await axios.get(`api/v1/datasets/${processingConfig.dataset.id}`)).data
    if (!datasetGet) throw new Error(`Le jeu de données n'existe pas, id=${processingConfig.dataset.id}`)
    await log.info(`Le jeu de données existe, id="${datasetGet.id}", title="${datasetGet.title}"`)

    const dataset = await postForm(context, `api/v1/datasets/${processingConfig.dataset.id}`, (formData) => {
      formData.append('title', processingConfig.dataset.title)
      formData.append('extras', JSON.stringify({ processingId }))
      formData.append('file', fs.createReadStream(outputFileCsv), { filename: fileNameCsv })
    })
    await log.info(`Jeu de données mis à jour, id="${dataset.id}", title="${dataset.title}".`)
  } else if (processingConfig.datasetMode === 'lines') {
    const resultBulk = await postForm(context, `api/v1/datasets/${processingConfig.dataset.id}/_bulk_lines`, (formData) => {
      formData.append('actions', fs.createReadStream(outputFileCsv), { filename: fileNameCsv })
    })
    await log.info(`lignes chargées: ${resultBulk.nbOk.toLocaleString()} ok, ${resultBulk.nbNotModified.toLocaleString()} sans modification, ${resultBulk.nbErrors.toLocaleString()} en erreur`)

    if (resultBulk.nbErrors) {
      await log.error(`${resultBulk.nbErrors} erreurs rencontrées`)
      for (const error of resultBulk.errors) {
        await log.error(JSON.stringify(error))
      }
    }
  }
}

export default upload
