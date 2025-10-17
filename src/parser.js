import * as microdata from 'microdata-node';
import * as htmlparser from 'htmlparser2';
import { decode } from 'html-entities';

function isJsonLd(name, attribs) {
    return attribs.type === 'application/ld+json';
}

function isInterestingLink(name, attribs) {
    return ['canonical', 'icon', 'manifest', 'shortcut'].includes(attribs.rel);
}

function isInterestingMetaName(name, attribs) {
    return ['description', 'keywords', 'robots'].includes(attribs.name);
}

function isInterestingMetaProperty(name, attribs) {
    return [
        'article:author',
        'article:expiration_time',
        'article:modified_time',
        'article:published_time',
        'article:section',
        'article:tag',
        'book:author',
        'book:isbn',
        'book:release_date',
        'book:tag',
        'fb:app_id',
        'fb:pages',
        'music:album',
        'music:album:disc',
        'music:album:track',
        'music:creator',
        'music:duration',
        'music:musician',
        'music:release_date',
        'music:song',
        'music:song:disc',
        'music:song:track',
        'og:audio',
        'og:audio:secure_url',
        'og:audio:type',
        'og:description',
        'og:determiner',
        'og:image',
        'og:image:alt',
        'og:image:height',
        'og:image:secure_url',
        'og:image:type',
        'og:image:url',
        'og:image:width',
        'og:locale',
        'og:locale:alternate',
        'og:site_name',
        'og:title',
        'og:type',
        'og:url',
        'og:video',
        'og:video:height',
        'og:video:secure_url',
        'og:video:type',
        'og:video:url',
        'og:video:width',
        'profile:first_name',
        'profile:gender',
        'profile:last_name',
        'profile:username',
        'twitter:card',
        'twitter:description',
        'twitter:image',
        'twitter:title',
        'video:actor',
        'video:actor:role',
        'video:director',
        'video:duration',
        'video:release_date',
        'video:series',
        'video:tag',
        'video:writer',
    ].includes(attribs.property);
}

function parse(html) {
    const metadata = {};
    let jsonLd = [];
    let currentTag = '';
    let inHead = false;

    const parser = new htmlparser.Parser(
        {
            onclosetag(name) {
                if (name === 'head') {
                    inHead = false;
                }
                currentTag = '';
            },
            onopentag(name, attribs) {
                currentTag = name;

                switch (name) {
                    case 'head':
                        inHead = true;
                        break;
                    case 'link':
                        if (isInterestingLink(name, attribs)) {
                            metadata[attribs.rel] = attribs.href;
                        }
                        break;
                    case 'meta':
                        if (isInterestingMetaName(name, attribs)) {
                            metadata[attribs.name] = attribs.content;
                        }
                        if (isInterestingMetaProperty(name, attribs)) {
                            metadata[attribs.property] = attribs.content;
                        }
                        break;
                    case 'script':
                        if (isJsonLd(name, attribs)) {
                            currentTag = 'jsonLd';
                        }
                        break;
                    default:
                        break;
                }
            },
            ontext(text) {
                switch (currentTag) {
                    case 'h1':
                        if (metadata.h1) {
                            metadata.h1.push(text);
                        } else {
                            metadata.h1 = [text];
                        }
                        break;
                    case 'jsonLd':
                        jsonLd.push(JSON.parse(decode(text)));
                        break;
                    case 'title':
                        if (inHead) {
                            metadata.title = text;
                        }
                        break;
                    default:
                        break;
                }
            },
        },
        { decodeEntities: true }
    );
    parser.write(html);
    parser.end();

    if (jsonLd.length === 1) {
        jsonLd = jsonLd[0];
    }

    return { jsonLd, metadata, microdata: microdata.toJson(html)?.items || [] };
}

export { parse };
