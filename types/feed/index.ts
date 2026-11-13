// Shapes of the items produced by xml2js (explicitArray: false) on a feed; these are not validated,
// remote feeds can deviate from them (attributes turn a string into { _, $ }, repeated tags into arrays)
export type RssItem = {
  title?: string | { _: string };
  link?: string;
  description?: string;
  pubDate?: string;
  enclosure?: {
    $?: {
      url: string;
    };
  };
  'media:content'?: {
    $?: {
      url: string;
    };
  };
}

export type AtomItem = {
  title?: string;
  link?: {
    $?: {
      href: string;
    };
  } | string;
  summary?: string | { _?: string } | Array<string | { _?: string }>;
  updated?: string;
  'media:content'?: {
    $?: {
      url: string;
    };
  };
}

export type OutputItem = {
  title: string;
  link: string;
  datePublication: string;
  description: string;
  image: string;
}
