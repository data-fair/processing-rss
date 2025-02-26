// lib/parseRss.ts
import { parseStringPromise } from 'xml2js'
import type { RssItem } from '#types'

/**
 * Parse un flux RSS brut en un objet JSON avec langue et articles.
 * @param {string} rssData - Contenu brut du flux RSS.
 * @returns {Promise<RssData>} - Objet JSON contenant les articles parsés.
 */
export const parseRss = async (rssData: string, type: string): Promise<Array<RssItem>> => {
  try {
    const parsed = await parseStringPromise(rssData, { trim: true, explicitArray: false })
    let items: RssItem[] = []

    if (type === 'rss') {
      items = parsed?.rss?.channel?.item ?? []
    } else if (type === 'atom') {
      items = parsed?.feed?.entry ?? []
    }

    if (!Array.isArray(items)) {
      items = [items]
    }
    return items
  } catch (error: any) {
    console.error(`Erreur lors du parsing du flux RSS : ${error.message}`)
    throw error
  }
}
