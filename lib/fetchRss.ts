import type { ProcessingContext } from '@data-fair/lib-common-types/processings.js'

/**
 * Download a feed and return its raw content.
 */
export const fetchRss = async (url: string, axios: ProcessingContext['axios']): Promise<string> => {
  try {
    // external source: the context axios refuses redirects by default and has no timeout
    const response = await axios.get(url, { maxRedirects: 5, timeout: 60000, responseType: 'text', maxContentLength: 200 * 1024 * 1024 })
    return response.data
  } catch (error: any) {
    throw new Error(`Failed to download the feed from ${url}: ${error.message}`)
  }
}
