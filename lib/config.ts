import type { ApiConfig } from '../config/type/index.ts'
import config from 'config'
// we reload the config instead of using the singleton from the config module for testing purposes
// @ts-ignore
const apiConfig = process.env.NODE_ENV === 'test' ? config.util.loadFileConfigs(process.env.NODE_CONFIG_DIR, { skipConfigSources: true }) : config
config.util.makeImmutable(apiConfig)

export default apiConfig as ApiConfig
