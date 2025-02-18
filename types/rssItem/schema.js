export default {
  $id: 'https://github.com/data-fair/processing-rss/rssitem',
  'x-exports': [
    'types',
    'validate'
  ],
  title: 'RssItem',
  type: 'object',
  additionalProperties: false,
  required: [
    'title',
    'link',
    'description',
    'pubDate',
  ],
  properties: {
    title: {
      type: 'string'
    },
    link: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    pubDate: {
      type: 'string'
    },
    enclosure: {
      type: 'object',
      properties: {
        $: {
          type: 'object',
          properties: {
            url: {
              type: 'string'
            }
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
    },
    'media:content': {
      type: 'object',
      properties: {
        $: {
          type: 'object',
          properties: {
            url: {
              type: 'string'
            }
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
    }
  }
}
