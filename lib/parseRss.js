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

    if (!items) {
      throw new Error('Aucun article trouvé dans le flux RSS.')
    }

    const itemsList = Array.isArray(items) ? items : [items]
    return { items: itemsList }
  } catch (error) {
    console.error(`Erreur lors du parsing du flux RSS : ${error.message}`)
    throw error
  }
}
