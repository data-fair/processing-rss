import { type Config, assertValid } from '../config/type/index.ts'
import config from 'config'
assertValid(config, { lang: 'en', name: 'config', internal: true })
export default config as Config
