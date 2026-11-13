import type { RunFunction } from '@data-fair/lib-common-types/processings.js'
import type { ProcessingConfig } from '#types/processingConfig/index.ts'
import fs from 'fs-extra'
import path from 'node:path'
import { fetchRss } from './fetchRss.ts'
import { parseRss } from './parseRss.ts'
import { transformToCsv } from './transform.ts'
import upload from './upload.ts'

let shouldBeStopped = false

export const stop = async (): Promise<void> => { shouldBeStopped = true }

export const run: RunFunction<ProcessingConfig> = async (context) => {
  const { processingConfig, tmpDir, axios, log } = context
  shouldBeStopped = false

  if (processingConfig.url == null) {
    throw new Error('Le lien du flux n\'est pas renseigné')
  } else if (processingConfig.type === null) {
    throw new Error('Le type de flux n\'est pas renseigné (RSS,Atom)')
  } else if (processingConfig.type !== 'rss' && processingConfig.type !== 'atom') {
    throw new Error('Le type n\'est pas correct (RSS,Atom)')
  }

  await log.info('Récupération du flux RSS...')
  const rssData = await fetchRss(processingConfig.url, axios)
  await log.info('Flux RSS récupéré.')

  await log.info('Parsing des données RSS...')
  const items = await parseRss(rssData, processingConfig.type)
  const csvData = transformToCsv(items, processingConfig.type)
  // fixed local name: the dataset title is chosen by the user and must not become a path
  const outputFileCsv = path.join(tmpDir, 'rss.csv')

  await log.info('Écriture des données CSV dans un fichier...')
  await fs.ensureDir(tmpDir)
  await fs.writeFile(outputFileCsv, csvData)
  await log.info(`Fichier CSV généré : ${outputFileCsv}`)

  if (shouldBeStopped) {
    await log.warning('Traitement interrompu, pas de publication')
    return
  }

  await upload(context, outputFileCsv)
}
