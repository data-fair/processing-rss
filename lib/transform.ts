import type { RssItem, AtomItem, OutputItem } from '#types'
import { parse } from 'json2csv'
import TurndownService from 'turndown'
import dayjs from 'dayjs'

const transformToMarkdown = (html?: string): string => {
  if (!html) return ''
  const turndown = new TurndownService()
  return turndown.turndown(html)
}

const parseToISO = (dateStr: string): string => {
  try {
    const parsedDate = dayjs(dateStr)
    if (parsedDate.isValid()) {
      return parsedDate.toISOString()
    } else {
      return 'Format Date non valide'
    }
  } catch (e) {
    console.error('Erreur lors du parsing de la date', e)
    return 'Erreur de conversion de la date'
  }
}

const extractText = (data: unknown): string => {
  if (typeof data === 'string') return data
  if (data && typeof data === 'object' && '_' in data) return String((data as { _: string })._)
  return ''
}

export const transformToCsv = (items: Array<RssItem | AtomItem>, type: string): string => {
  let csvData: OutputItem[] = []

  try {
    csvData = items.map(item => {
      const data: OutputItem = {
        title: transformToMarkdown(item.title as string) || 'Titre inconnu',
        link: '#',
        datePublication: 'Pas de date disponible',
        description: 'Pas de description disponible.',
        image: "Pas d'image disponible"
      }

      if (type === 'rss') {
        const rssItem = item as RssItem
        data.link = rssItem.link || '#'
        data.datePublication = parseToISO(rssItem.pubDate || '') || 'Pas de date disponible'
        data.description = transformToMarkdown(rssItem.description || '') || 'Pas de description disponible.'
        data.image = rssItem.enclosure?.$?.url || rssItem['media:content']?.$?.url || "Pas d'image disponible"
      } else if (type === 'atom') {
        const atomItem = item as AtomItem
        data.link = typeof atomItem.link === 'object' && !Array.isArray(atomItem.link) && atomItem.link.$ ? atomItem.link.$.href : (atomItem.link as string) || '#'
        data.datePublication = parseToISO(atomItem.updated || '') || 'Pas de date disponible'
        data.description = transformToMarkdown(
          Array.isArray(atomItem.summary)
            ? extractText(atomItem.summary[0])
            : extractText(atomItem.summary)
        ) || 'Pas de description disponible.'
        data.image = atomItem['media:content']?.$?.url || "Pas d'image disponible"
      }

      return data
    })
  } catch (error: any) {
    console.error(`Erreur lors de la conversion en CSV : ${error.message}`)
  }

  return csvData.length > 0 ? parse(csvData) : ''
}
