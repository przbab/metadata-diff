import * as microdata from 'microdata-node';
import * as htmlparser from 'htmlparser2';
import { decode } from 'html-entities';
import { defaultLinkTags, defaultMetaNameTags, defaultMetaPropertyTags } from './constants.js';

function isJsonLd(name, attribs) {
    return attribs.type === 'application/ld+json';
}

function getParsedTags(defaultTags, overrides) {
    const parsedTags = [...defaultTags];
    if (overrides) {
        Object.entries(overrides).forEach(([tag, include]) => {
            if (include) {
                parsedTags.push(tag);
            } else if (parsedTags.includes(tag)) {
                parsedTags.splice(parsedTags.indexOf(tag), 1);
            }
        });
    }

    return parsedTags;
}

function parse(html, config) {
    const metadata = {};
    let jsonLd = [];
    let currentTag = '';
    let inHead = false;

    const parsedLinkTags = getParsedTags(defaultLinkTags, config.parsedMetadata?.linkTags);
    console.log('🚀 ~ parse ~ parsedLinkTags:', parsedLinkTags);

    function shouldParseLinkTag(attribs) {
        return parsedLinkTags.includes(attribs.rel);
    }

    const parsedMetaNameTags = getParsedTags(defaultMetaNameTags, config.parsedMetadata?.metaNameTags);
    console.log('🚀 ~ parse ~ parsedMetaNameTags:', parsedMetaNameTags);

    function shouldParseMetaNameTag(attribs) {
        return parsedMetaNameTags.includes(attribs.name);
    }

    const parsedMetaPropertyTags = getParsedTags(defaultMetaPropertyTags, config.parsedMetadata?.metaPropertyTags);
    console.log('🚀 ~ parse ~ parsedMetaPropertyTags:', parsedMetaPropertyTags);

    function shouldParseMetaPropertyTag(attribs) {
        return parsedMetaPropertyTags.includes(attribs.property);
    }

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
                        if (shouldParseLinkTag(attribs)) {
                            metadata[attribs.rel] = attribs.href;
                        }
                        break;
                    case 'meta':
                        if (shouldParseMetaNameTag(attribs)) {
                            metadata[attribs.name] = attribs.content;
                        }
                        if (shouldParseMetaPropertyTag(attribs)) {
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
