import express from 'express';
import RSSParser from 'rss-parser';
import { Builder } from 'xml2js';
import { promises as fs } from 'fs';
import { supabase } from '../supabaseClient.js'; // Ajoutez '.js' ici

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
        const { feedUrls, channelConfig, user } = req.body;

        if (!feedUrls || !Array.isArray(feedUrls) || feedUrls.length === 0) {
            return res.status(400).json({ error: 'Les URLs des flux RSS sont requises' });
        }

        if (!user || !user.id) {
            throw new Error('Utilisateur non authentifié');
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
            renderOpts: { pretty: true, doubleQuotes: true },
            cdata: true,
            headless: true // Empêche l'ajout d'un en-tête XML supplémentaire
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
            .sort((a, b) => new Date(b.pubDate[0] || 0) - new Date(a.pubDate[0] || 0))
            .slice(0, channelConfig.itemsLimit || 20); // Ajout de la limite d'items

        // Construction du flux combiné avec un seul tag RSS et gestion des valeurs vides
        const combinedFeed = {
            $: {
                version: '2.0'
            },
            channel: [{
                title: [channelConfig.title || 'Untitled Feed'],
                description: [channelConfig.description || ''],
                link: [channelConfig.link || '#'],  // Valeur par défaut si vide
                language: [channelConfig.language || 'en'],
                pubDate: [new Date().toUTCString()],
                item: allItems.map(item => ({
                    ...item,
                    title: [item.title?.[0] || 'Untitled'],
                    description: [item.description?.[0] || ''],
                    link: [item.link?.[0] || '#'],
                    guid: [item.guid?.[0] || item.link?.[0] || '#'],
                    pubDate: [item.pubDate?.[0] || new Date().toUTCString()]
                }))
            }]
        };

        // Utilisation d'une approche différente pour la construction XML
        const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
                   '<rss version="2.0">\n' +
                   builder.buildObject(combinedFeed)
                         .replace(/<\/?rss[^>]*>/g, '')
                         .replace(/>\s*</g, '>\n<') + // Améliore la lisibilité
                   '</rss>';

        const outputDir = './xml';
        await fs.mkdir(outputDir, { recursive: true });
        const filename = `combined-${Date.now()}.xml`;
        const filePath = `${outputDir}/${filename}`;

        // Écrire le fichier XML physiquement
        await fs.writeFile(filePath, xml, 'utf8');

        // Après la génération du XML et l'écriture du fichier
        try {
            const { data: configData, error: configError } = await supabase
                .from('rss_configs')
                .insert({
                    user_id: user.id,
                    title: channelConfig.title,
                    description: channelConfig.description,
                    link: channelConfig.link,
                    language: channelConfig.language,
                    nbr_items: channelConfig.itemsLimit,
                    filename: filename, // Ajout du nom de fichier
                    created_at: new Date().toISOString() // Ajouter explicitement la date de création
                })
                .select();

            if (configError) throw configError;

            const config_id = configData[0].id;

            // Insérer dans rss_sources
            const sourcesData = feedUrls.map(url => ({
                config_id: config_id,
                url: url
            }));

            const { error: sourcesError } = await supabase
                .from('rss_sources')
                .insert(sourcesData);

            if (sourcesError) throw sourcesError;

            // Sauvegarder le XML
            const { error: feedError } = await supabase
                .from('rss_combined_feeds')
                .insert({
                    config_id: config_id,
                    xml_content: xml
                });

            if (feedError) throw feedError;
        } catch (dbError) {
            console.error('Erreur Supabase:', dbError);
            // On continue quand même pour renvoyer le XML
        }

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