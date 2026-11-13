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
    await log.step('Creating the dataset')
    const dataset = await postForm(context, 'api/v1/datasets/', (formData) => {
      formData.append('title', processingConfig.dataset.title)
      formData.append('extras', JSON.stringify({ processingId }))
      formData.append('file', fs.createReadStream(outputFileCsv), { filename: fileNameCsv })
    })
    await log.info(`Dataset created, id="${dataset.id}", title="${dataset.title}"`)
    await patchConfig({ datasetMode: 'update', dataset: { id: dataset.id, title: dataset.title } })
  } else if (processingConfig.datasetMode === 'update') {
    await log.step('Checking the dataset')
    const datasetGet = (await axios.get(`api/v1/datasets/${processingConfig.dataset.id}`)).data
    if (!datasetGet) throw new Error(`Dataset not found, id="${processingConfig.dataset.id}"`)
    await log.info(`Dataset found, id="${datasetGet.id}", title="${datasetGet.title}"`)
    await log.step('Uploading the CSV file')

    const dataset = await postForm(context, `api/v1/datasets/${processingConfig.dataset.id}`, (formData) => {
      formData.append('title', processingConfig.dataset.title)
      formData.append('extras', JSON.stringify({ processingId }))
      formData.append('file', fs.createReadStream(outputFileCsv), { filename: fileNameCsv })
    })
    await log.info(`Dataset updated, id="${dataset.id}", title="${dataset.title}"`)
  } else if (processingConfig.datasetMode === 'lines') {
    await log.step('Sending the lines to the dataset')
    const resultBulk = await postForm(context, `api/v1/datasets/${processingConfig.dataset.id}/_bulk_lines`, (formData) => {
      formData.append('actions', fs.createReadStream(outputFileCsv), { filename: fileNameCsv })
    })
    await log.info(`Lines sent: ${resultBulk.nbOk} ok, ${resultBulk.nbNotModified} not modified, ${resultBulk.nbErrors} in error`)

    if (resultBulk.nbErrors) {
      await log.error(`${resultBulk.nbErrors} line(s) rejected by data-fair`)
      for (const error of resultBulk.errors) {
        await log.error(JSON.stringify(error))
      }
    }
  }
}

export default upload
