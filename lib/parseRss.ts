import type { RssItem, AtomItem } from '#types/feed/index.ts'
import { parseStringPromise } from 'xml2js'

/**
 * Parse a raw RSS or Atom feed and return its items (RSS `item` or Atom `entry` elements).
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
    throw new Error(`Failed to parse the ${type} feed as XML: ${error.message}`)
  }
}
