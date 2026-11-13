import type { RssItem, AtomItem } from '#types/feed/index.ts'
import { parseStringPromise } from 'xml2js'

/**
 * Parse un flux RSS brut en un objet JSON avec langue et articles.
 * @param {string} rssData - Contenu brut du flux RSS.
 * @returns {Promise<RssData>} - Objet JSON contenant les articles parsés.
 */
export const parseRss = async (rssData: string, type: string): Promise<Array<RssItem | AtomItem>> => {
  try {
    const parsed = await parseStringPromise(rssData, { trim: true, explicitArray: false })
    let items: RssItem[] | AtomItem[] = []

    if (type === 'rss') {
      items = parsed?.rss?.channel?.item ?? []
    } else if (type === 'atom') {
      items = parsed?.feed?.entry ?? []
    }

    if (!Array.isArray(items)) items = [items]

    return items
  } catch (error: any) {
    console.error(`Erreur lors du parsing du flux RSS : ${error.message}`)
    throw error
  }
}
