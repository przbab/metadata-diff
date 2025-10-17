import * as microdata from 'microdata-node';
import * as htmlparser from 'htmlparser2';
import { decode } from 'html-entities';
import { defaultLinks, defaultMetaNames, defaultMetaProperties } from './constants.js';

function isJsonLd(name, attribs) {
    return attribs.type === 'application/ld+json';
}

function isInterestingLink(name, attribs) {
    return defaultLinks.includes(attribs.rel);
}

function isInterestingMetaName(name, attribs) {
    return defaultMetaNames.includes(attribs.name);
}

function isInterestingMetaProperty(name, attribs) {
    return defaultMetaProperties.includes(attribs.property);
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
