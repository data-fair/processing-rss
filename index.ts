import type { PrepareFunction, RunFunction } from '@data-fair/lib-common-types/processings.js'
import type { ProcessingConfig } from './types/processingConfig/index.ts'

/**
 * Function to prepare a processing (trigger when the config is updated).
 * It can be used to:
 * - throw additional errors to validate the config
 * - remove secrets from the config and store them in the secrets object
 */
export const prepare: PrepareFunction<ProcessingConfig> = async (context) => {
  const prepare = (await import('./lib/prepare.ts')).default
  return prepare(context)
}

/**
 * Function to execute the processing (triggered when the processing is started).
 * This is the main function of the plugin where the business logic is implemented.
 */
export const run: RunFunction<ProcessingConfig> = async (context) => {
  const { run } = await import('./lib/execute.ts')
  return run(context)
}

/**
 * Function to stop the processing (triggered when the processing is stopped).
 * It is used to manage interruption and prevent incoherent state.
 * The run method should finish shortly after calling stop.
 * Not required, but can be useful for long processing or to prevent incoherent state in case of interruption.
 */
export const stop = async () => {
  const { stop } = await import('./lib/execute.ts')
  return stop()
}
