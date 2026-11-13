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
    throw new Error('The feed URL is missing')
  } else if (processingConfig.type == null) {
    throw new Error('The feed type is missing (rss or atom)')
  } else if (processingConfig.type !== 'rss' && processingConfig.type !== 'atom') {
    throw new Error(`Unknown feed type "${processingConfig.type}", expected rss or atom`)
  }

  await log.step('Downloading the feed')
  const rssData = await fetchRss(processingConfig.url, axios)
  await log.info(`Feed downloaded (${Buffer.byteLength(rssData ?? '')} bytes)`)

  await log.step('Converting the feed to CSV')
  const items = await parseRss(rssData, processingConfig.type)
  await log.info(`${items.length} item(s) found in the ${processingConfig.type} feed`)
  const csvData = transformToCsv(items, processingConfig.type)
  // fixed local name: the dataset title is chosen by the user and must not become a path
  const outputFileCsv = path.join(tmpDir, 'rss.csv')

  await fs.ensureDir(tmpDir)
  await fs.writeFile(outputFileCsv, csvData)
  await log.info(`CSV file written (${Buffer.byteLength(csvData)} bytes)`)

  if (shouldBeStopped) {
    await log.warning('Processing interrupted, nothing uploaded')
    return
  }

  await upload(context, outputFileCsv)
}
