import neostandard from 'neostandard'
import dfLibRecommended from '@data-fair/lib-utils/eslint/recommended.js'

export default [
  { ignores: ['config/*', 'data/'] },
  ...dfLibRecommended,
  ...neostandard({ ts: true })
]
