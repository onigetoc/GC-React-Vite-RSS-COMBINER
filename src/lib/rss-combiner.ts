// Ce fichier n'est plus nécessaire côté client
// ...vous pouvez supprimer ou commenter le code existant...

import Parser from 'rss-parser';
import { xml2js, Builder } from 'xml2js';

export interface FeedConfig {
  title: string;
  description: string;
  link: string;
  language: string;
}

export interface RSSItem {
  title: string;
  description: string;
  link: string;
  guid?: string;
  pubDate?: string;
  enclosure?: {
    url: string;
    length?: string;
    type?: string;
  };
}

export const parseRSSFeeds = async (feedUrls: string[], config: FeedConfig) => {
  const parser = new Parser({
    customFields: {
      item: ['media:content', 'enclosure']
    }
  });

  try {
    const feeds = await Promise.all(
      feedUrls.map(url => parser.parseURL(url.trim()))
    );

    const allItems = feeds
      .flatMap(feed => feed.items || [])
      .sort((a, b) => new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime())
      .slice(0, 25);

    const builder = new Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8' },
      renderOpts: { pretty: true }
    });

    const combinedFeed = {
      rss: {
        $: {
          version: '2.0',
          'xmlns:atom': 'http://www.w3.org/2005/Atom'
        },
        channel: [{
          title: config.title,
          description: config.description,
          link: config.link,
          language: config.language,
          lastBuildDate: new Date().toUTCString(),
          item: allItems.map(item => ({
            title: item.title,
            description: item.description,
            link: item.link,
            guid: item.guid || item.link,
            pubDate: item.pubDate
          }))
        }]
      }
    };

    return builder.buildObject(combinedFeed);
  } catch (error) {
    console.error('Erreur lors de la génération du flux RSS:', error);
    throw error;
  }
};