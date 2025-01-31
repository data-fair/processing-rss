const { parseStringPromise } = require('xml2js')

/**
 * Parse un flux RSS brut en un objet JSON avec langue et articles.
 * @param {string} rssData - Contenu brut du flux RSS.
 * @returns {Promise<object>} - Objet JSON contenant la langue et les articles parsés.
 */
exports.parseRss = async (rssData) => {
  try {
    const parsed = await parseStringPromise(rssData, { trim: true, explicitArray: false })
    const items = parsed?.rss?.channel?.item
    const lang = parsed?.rss?.channel?.language || 'en'

    if (!items) {
      throw new Error('Aucun article trouvé dans le flux RSS.')
    }

    const articleList = Array.isArray(items) ? items : [items]
    return { lang, items: articleList }
  } catch (error) {
    console.error(`Erreur lors du parsing du flux RSS : ${error.message}`)
    throw error
  }
}
