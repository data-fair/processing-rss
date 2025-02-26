export default {
  $id: 'https://github.com/data-fair/processing-rss/rssitem',
  'x-exports': ['types', 'validate'],
  title: 'RssItem',
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
    link: {
      oneOf: [
        { type: 'string' },
        {
          type: 'object',
          additionalProperties: false,
          properties: {
            $: {
              type: 'object',
              additionalProperties: false,
              properties: {
                href: { type: 'string' }
              },
            }
          },
        }
      ]
    },
    description: { type: 'string' },
    summary: { type: 'string' },
    pubDate: { type: 'string' },
    updated: { type: 'string' },
    enclosure: {
      type: 'object',
      additionalProperties: false,
      properties: {
        $: {
          type: 'object',
          additionalProperties: false,
          properties: {
            url: { type: 'string' }
          },
          required: ['url']
        }
      }
    },
    'media:content': {
      type: 'object',
      additionalProperties: false,
      properties: {
        $: {
          type: 'object',
          additionalProperties: false,
          properties: {
            url: { type: 'string' }
          },
          required: ['url']
        }
      }
    }
  }
}
