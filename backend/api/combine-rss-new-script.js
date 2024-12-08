const fs = require('fs').promises;
const RSSParser = require('rss-parser');
// const { feedUrls } = require('./feeds.js');
// const { channelInfo, itemsLimit } = require('./channelsettings.js');
const xml2js = require('xml2js');

// const xml2js = require('xml2js').parseString;
// const stripNS = require('xml2js').processors.stripPrefix;

// parseString(xml_str, { tagNameProcessors: [stripNS] },function(err, result) {});

async function mixRSSFeeds({ feedUrls, customChannel, outputPath }) {
    const parser = new RSSParser({
        timeout: 5000,
        headers: {
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
            'User-Agent': 'Mozilla/5.0'
        },
        maxRedirects: 5,
        requestOptions: {
            follow: true,
            followRedirect: true
        },
        defaultRSS: 2.0,
        customFields: {
            item: [
                ['description', 'description'],
                ['itunes:*', 'itunes'],
                ['media:*', 'media'],
                ['dc:*', 'dc'],
                ['content:*', 'content'],
                ['podcast:*', 'podcast'],
                ['enclosure', 'enclosure'],
                ['image', 'image'],
                ['media:thumbnail', 'mediaThumbnail'],
                ['media:content', 'mediaContent'],
                '*',
                ['itunes:image', 'itunesImage'],
                ['imageUrl', 'imageUrl']
            ]
        }
    });

    // Fonction forceHttps uniquement pour les URLs des feeds
    const forceHttps = (url) => {
        if (!url) return '';
        return url.replace(/^http:\/\//i, 'https://');
    };

    const builder = new xml2js.Builder({ 
        xmldec: { version: '1.0', encoding: 'UTF-8' },
        renderOpts: { pretty: true },
        cdata: true  // Activer le support CDATA natif
    });

    // Modifier la fonction wrapCDATA pour utiliser le format natif de xml2js
    const wrapCDATA = (text) => {
        if (!text) return '';
        if (typeof text === 'object' && text._) {
            text = text._;
        }
        return { _: String(text).trim() };
    };

    const feeds = await Promise.all(feedUrls.map(async (url) => {
        try {
            // Forcer HTTPS uniquement pour les URLs des feeds
            const feed = await parser.parseURL(forceHttps(url));
            console.log(`Flux RSS parsé avec succès: ${url} (${feed.items.length} articles)`);
            return feed;
        } catch (error) {
            console.error(`Erreur lors du parsing du flux RSS à l'URL ${url} :`, error.message);
            return null;
        }
    }));

    const validFeeds = feeds.filter(feed => feed !== null);
    console.log(`Nombre de flux valides: ${validFeeds.length}`);

    // Récupérer tous les items et les trier par date
    // Standardiser et nettoyer les items
    const allItems = validFeeds
        .flatMap(feed => feed.items || [])
        .map(item => {
            // Chercher une image
            const itemImage = (() => {
                const sources = [
                    item.image?.url,
                    item.image,
                    item.mediaContent?.url,
                    item.mediaContent,
                    item.mediaThumbnail?.url,
                    item.mediaThumbnail,
                    item.itunesImage?.href,
                    item.itunesImage
                ];
                
                const validUrl = sources.find(src => src && typeof src === 'string') ||
                    extractImageFromDescription(item.description) ||
                    extractImageFromDescription(item.content) ||
                    extractImageFromDescription(item['content:encoded']);
            
                return validUrl;
            })();

            // Construire l'item
            const baseItem = {
                title: wrapCDATA(item.title),
                description: wrapCDATA(item.description),
                link: item.link,
                guid: item.guid || item.link,
                pubDate: item.pubDate
            };

            // Ajouter l'image si présente
            if (itemImage) {
                baseItem['media:thumbnail'] = {
                    $: { url: itemImage }
                };
                if (itemImage) {
                    console.log(`Image trouvée pour "${item.title}": ${itemImage}`);
                }
            }

            // Ajouter l'enclosure si présent
            if (item.enclosure) {
                baseItem.enclosure = {
                    $: {
                        url: item.enclosure.url || '',
                        length: String(item.enclosure.length || '0'),
                        type: item.enclosure.type || determineMediaType(item.enclosure.url)
                    }
                };
            }

            // Ajouter les champs iTunes
            if (item.itunes) {
                Object.entries(item.itunes).forEach(([key, value]) => {
                    baseItem[`itunes:${key}`] = typeof value === 'string' ? wrapCDATA(value) : value;
                });
            }

            return baseItem;
        })
        .sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0))
        .slice(0, itemsLimit);

    console.log(`Nombre total d'articles (après limite): ${allItems.length}`);

    // Aide à déterminer le type MIME
    function determineMediaType(url = '') {
        if (!url) return 'application/octet-stream';
        if (url.match(/\.(jpg|jpeg|png)$/i)) return 'image/jpeg';
        if (url.match(/\.(mp3)$/i)) return 'audio/mpeg';
        if (url.match(/\.(mp4)$/i)) return 'video/mp4';
        return 'application/octet-stream';
    }

    // Collecter tous les namespaces utilisés dans les flux sources
    const namespaces = {};
    validFeeds.forEach(feed => {
        if (feed['xmlns']) {
            Object.assign(namespaces, feed['xmlns']);
        }
    });

    // Modifier la structure du feed combiné
    const combinedFeed = {
        rss: {
            $: { 
                version: '2.0',
                'xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
                'xmlns:podcast': 'https://podcastindex.org/namespace/1.0',
                'xmlns:content': 'http://purl.org/rss/1.0/modules/content/',
                'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
                'xmlns:media': 'http://search.yahoo.com/mrss/',
                'xmlns:atom': 'http://www.w3.org/2005/Atom'
            },
            channel: [{
                title: { _: customChannel.title },
                description: { _: customChannel.description },
                link: customChannel.link,
                language: customChannel.language,
                pubDate: customChannel.pubDate,
                lastBuildDate: new Date().toUTCString(),
                // Conserver les items tels quels sans les retraiter
                item: allItems
            }]
        }
    };

    try {
        // Créer le dossier 'rss' s'il n'existe pas
        const dir = './rss';
        await fs.mkdir(dir, { recursive: true });

        const xml = builder.buildObject(combinedFeed);
        
        await fs.writeFile(outputPath, xml, 'utf8');
        
        console.log('XML généré avec succès');
        return true;
    } catch (error) {
        console.error('Erreur lors de la génération XML:', error);
        throw error;
    }
}

async function generateCombinedRSS() {
    try {
        const outputFile = './rss/combinedfeed.xml';
        await mixRSSFeeds({
            feedUrls,
            customChannel: channelInfo,
            outputPath: outputFile
        });

        console.log(`Fichier RSS combiné généré avec succès : ${outputFile}`);
    } catch (error) {
        console.error('Erreur lors de la génération du flux RSS :', error.message);
    } finally {
        // Retarder la sortie pour permettre l'écriture du fichier
        setTimeout(() => process.exit(0), 2000);
    }
}

function resetModule() {
    delete require.cache[require.resolve('./rss-combiner.js')];
}

function extractImageFromDescription(description) {
    const imgMatch = description?.match(/<img.+src=['"](.*?)['"]/i);
    if (imgMatch && imgMatch[1]) {
      const imgSrc = imgMatch[1];
      // Ignore Feedburner images and gifs comme dans votre code PHP
      if (!imgSrc.match(/(feedburner\.com|\.gif)/i)) {
        return imgSrc;
      }
    }
    return null;
  }

module.exports = { generateCombinedRSS, resetModule };

if (require.main === module) {
    (async () => {
        await generateCombinedRSS();
    })();
} // Ajout de l'accolade fermante manquante