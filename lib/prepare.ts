import type { PrepareFunction } from '@data-fair/lib-common-types/processings.js'
import type { ProcessingConfig } from '#types/processingConfig/index.ts'

// no secret in the config of this plugin
const prepare: PrepareFunction<ProcessingConfig> = async ({ processingConfig, secrets }) => {
  return { processingConfig, secrets }
}

export default prepare
