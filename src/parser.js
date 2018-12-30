'use strict';

const microdata = require('microdata-node');
const htmlparser = require('htmlparser2');

function parse(html) {
    const metadata = {};
    let currentTag = '';

    const parser = new htmlparser.Parser(
        {
            onopentag(name, attribs) {
                currentTag = name;

                switch (name) {
                    case 'link':
                        if (['canonical', 'icon', 'shortcut', 'manifest'].includes(attribs.rel)) {
                            metadata[attribs.rel] = attribs.href;
                        }
                        break;
                    case 'meta':
                        if (['description', 'keywords'].includes(attribs.name)) {
                            metadata[attribs.name] = attribs.content;
                        }
                        if (
                            [
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
                                'video:actor',
                                'video:actor:role',
                                'video:director',
                                'video:duration',
                                'video:release_date',
                                'video:series',
                                'video:tag',
                                'video:writer',
                            ].includes(attribs.property)
                        ) {
                            metadata[attribs.property] = attribs.content;
                        }
                        break;
                    default:
                        break;
                }
            },
            ontext(text) {
                switch (currentTag) {
                    case 'title':
                        metadata.title = text;
                        break;
                    case 'h1':
                        if (metadata.h1) {
                            metadata.h1.push(text);
                        } else {
                            metadata.h1 = [text];
                        }
                        break;
                    default:
                        break;
                }
            },
            onclosetag() {
                currentTag = '';
            },
        },
        { decodeEntities: true }
    );
    parser.write(html);
    parser.end();

    return { metadata, microdata: microdata.toJson(html) };
}

module.exports = parse;
