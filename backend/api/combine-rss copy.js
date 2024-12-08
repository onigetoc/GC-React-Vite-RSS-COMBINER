import express from 'express';
import RSSParser from 'rss-parser';
import { Builder } from 'xml2js';
import { promises as fs } from 'fs';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { feedUrls, channelConfig } = req.body;

    if (!feedUrls || !Array.isArray(feedUrls) || feedUrls.length === 0) {
      return res.status(400).json({ error: 'Les URLs des flux RSS sont requises' });
    }

    const parser = new RSSParser();
    const builder = new Builder({
      rootName: 'rss',
      xmldec: { version: '1.0', encoding: 'UTF-8' }
    });

    // Récupération et parsing des flux RSS
    const feeds = await Promise.all(
      feedUrls.map(url => parser.parseURL(url))
    );

    // Construction du flux combiné
    const combinedFeed = {
      rss: {
        $: { version: '2.0' },
        channel: [{
          title: [channelConfig.title],
          description: [channelConfig.description],
          link: [channelConfig.link],
          language: [channelConfig.language],
          pubDate: [new Date().toUTCString()],
          item: feeds.flatMap(feed => 
            (feed.items || []).map(item => ({
              title: [item.title],
              description: [item.description || ''],
              link: [item.link],
              guid: [item.guid || item.link],
              pubDate: [item.pubDate || new Date().toUTCString()]
            }))
          )
        }]
      }
    };

    const xml = builder.buildObject(combinedFeed);

    // Option : sauvegarder le fichier localement
    const outputDir = './generated';
    await fs.mkdir(outputDir, { recursive: true });
    const filename = `combined-${Date.now()}.xml`;
    await fs.writeFile(`${outputDir}/${filename}`, xml);

    res.json({
      success: true,
      xml: xml,
      filename: filename
    });

  } catch (error) {
    console.error('Erreur lors de la combinaison des flux:', error);
    res.status(500).json({
      error: 'Erreur lors de la combinaison des flux RSS',
      details: error.message
    });
  }
});

export default router;