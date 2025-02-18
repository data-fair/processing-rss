// lib/parseRss.ts
import { parseStringPromise } from 'xml2js'
import type { RssData, RssItem } from '#types'

/**
 * Parse un flux RSS brut en un objet JSON avec langue et articles.
 * @param {string} rssData - Contenu brut du flux RSS.
 * @returns {Promise<RssData>} - Objet JSON contenant les articles parsés.
 */
export const parseRss = async (rssData: string): Promise<RssData> => {
  try {
    const parsed = await parseStringPromise(rssData, { trim: true, explicitArray: false })
    let items: RssItem[] = parsed?.rss?.channel?.item ?? []

    if (!Array.isArray(items)) {
      items = [items]
    }
    return { items: items }
  } catch (error: any) {
    console.error(`Erreur lors du parsing du flux RSS : ${error.message}`)
    throw error
  }
}
