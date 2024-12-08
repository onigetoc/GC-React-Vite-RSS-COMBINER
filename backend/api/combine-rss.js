import express from 'express';
import RSSParser from 'rss-parser';
import { Builder } from 'xml2js';
import { promises as fs } from 'fs';

// Fonctions utilitaires
function extractImageFromDescription(description) {
    const imgMatch = description?.match(/<img.+src=['"](.*?)['"]/i);
    if (imgMatch && imgMatch[1]) {
        const imgSrc = imgMatch[1];
        if (!imgSrc.match(/(feedburner\.com|\.gif)/i)) {
            return imgSrc;
        }
    }
    return null;
}

function determineMediaType(url = '') {
    if (!url) return 'application/octet-stream';
    if (url.match(/\.(jpg|jpeg|png)$/i)) return 'image/jpeg';
    if (url.match(/\.(mp3)$/i)) return 'audio/mpeg';
    if (url.match(/\.(mp4)$/i)) return 'video/mp4';
    return 'application/octet-stream';
}

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { feedUrls, channelConfig } = req.body;

        if (!feedUrls || !Array.isArray(feedUrls) || feedUrls.length === 0) {
            return res.status(400).json({ error: 'Les URLs des flux RSS sont requises' });
        }

        const parser = new RSSParser({
            timeout: 5000,
            headers: {
                'Accept': 'application/rss+xml, application/xml, text/xml, */*',
                'User-Agent': 'Mozilla/5.0'
            },
            customFields: {
                item: [
                    ['description', 'description'],
                    ['itunes:*', 'itunes'],
                    ['media:*', 'media'],
                    ['content:*', 'content'],
                    ['enclosure', 'enclosure'],
                    ['image', 'image'],
                    ['media:thumbnail', 'mediaThumbnail'],
                    ['media:content', 'mediaContent']
                ]
            }
        });

        const builder = new Builder({
            rootName: 'rss',
            xmldec: { version: '1.0', encoding: 'UTF-8' },
            renderOpts: { pretty: true },
            cdata: true
        });

        const feeds = await Promise.all(
            feedUrls.map(url => parser.parseURL(url))
        );

        // Traitement amélioré des items
        const allItems = feeds
            .flatMap(feed => feed.items || [])
            .map(item => {
                const itemImage = (() => {
                    const sources = [
                        item.image?.url,
                        item.image,
                        item.mediaContent?.url,
                        item.mediaContent,
                        item.mediaThumbnail?.url,
                        item.mediaThumbnail
                    ];
                    
                    return sources.find(src => src && typeof src === 'string') ||
                        extractImageFromDescription(item.description) ||
                        extractImageFromDescription(item.content);
                })();

                const baseItem = {
                    title: [item.title],
                    description: [item.description || ''],
                    link: [item.link],
                    guid: [item.guid || item.link],
                    pubDate: [item.pubDate || new Date().toUTCString()]
                };

                if (itemImage) {
                    baseItem['media:thumbnail'] = [{ _: itemImage }];
                }

                if (item.enclosure) {
                    baseItem.enclosure = [{
                        $: {
                            url: item.enclosure.url || '',
                            length: String(item.enclosure.length || '0'),
                            type: item.enclosure.type || determineMediaType(item.enclosure.url)
                        }
                    }];
                }

                return baseItem;
            })
            .sort((a, b) => new Date(b.pubDate[0] || 0) - new Date(a.pubDate[0] || 0));

        // Construction du flux combiné avec la structure existante
        const combinedFeed = {
            rss: {
                $: {
                    version: '2.0',
                    'xmlns:media': 'http://search.yahoo.com/mrss/'
                },
                channel: [{
                    title: [channelConfig.title],
                    description: [channelConfig.description],
                    link: [channelConfig.link],
                    language: [channelConfig.language],
                    pubDate: [new Date().toUTCString()],
                    item: allItems
                }]
            }
        };

        const xml = builder.buildObject(combinedFeed);

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