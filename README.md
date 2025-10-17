# Metadata diff

## Command line

Usage: metadata-diff [options]

| Options       | Type    | Description                                                                         |
| ------------- | ------- | ----------------------------------------------------------------------------------- |
| --config, -c  | string  | Specify configuration file to use                                                   |
| --logLevel    | string  | Log level (avaliable options: `error`, `warn`, `info`, `verbose`, `debug`, `silly`) |
| --logToFile   | boolean | Save log to file                                                                    |
| --logFilename | string  | Log filename                                                                        |
| --help, -h    | boolean | Show help                                                                           |
| --version, -v | boolean | Show version number                                                                 |

## Configuration

Configuration will be validated against model described in [configuration file section](#configuration-file). The main way to configure library is throught configuration file. Cli options allow for setting configuration file and log level.

### Configuration file

Configuration is read using js `import` statement, so it may be a `.js` or `.json` file. The path to the configuration file may be set using `--config` or `-c` cli option.

| Property name                   | Required | Type                           | Description                                                                                                                                               |
| ------------------------------- | -------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| currentBaseUrl                  | yes      | string                         | Origin of _current_ host                                                                                                                                  |
| candidateBaseUrl                | yes      | string                         | Origin of _candidate_ host                                                                                                                                |
| headers                         | no       | object                         | Additional headers to be sent with each request, useful for custom user agent or authentication                                                           |
| minify                          | no       | boolean                        | Should the report be minified (Default: `true`)                                                                                                           |
| output                          | no       | string                         | Path for the output file (Default: `index.html`)                                                                                                          |
| outputDir                       | no       | string                         | Path for the output directory (Default: `dist`)                                                                                                           |
| parsedMetadata                  | no       | object                         | Object containing parsed metadata                                                                                                                         |
| parsedMetadata.linkTags         | no       | object                         | Object where keys are the value of rel property of link tag and value is boolean to turn parsing on/off                                                   |
| parsedMetadata.metaNameTags     | no       | object                         | Object where keys are the value of name property of meta tag and value is boolean to turn parsing on/off                                                  |
| parsedMetadata.metaPropertyTags | no       | object                         | Object where keys are the value of property property of meta tag and value is boolean to turn parsing on/off                                              |
| pathnames                       | yes      | array(string) OR array(object) | Array of pathnames to be tested                                                                                                                           |
| pathnames.path                  | yes      | string                         | Pathname to be tested                                                                                                                                     |
| pathnames.note                  | no       | string                         | Optional note for the pathname                                                                                                                            |
| puppeteerOption                 | no       | object                         | Puppeteer options                                                                                                                                         |
| puppeteerOption.additionalWait  | no       | number                         | By setting this property you may give puppeteer some timeout to increase the chance of completing js tasks. (Default: `0`)                                |
| puppeteerOption.blockRequests   | no       | array(string)                  | Array of regular expressions that will be matched against outgoing requests and cancelling matched. Intended for ads, tracking, etc.                      |
| puppeteerOption.goto            | no       | object                         | This property will be passed to puppeteer's `page.goto` as options. https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagegotourl-options |
| puppeteerOption.headless        | no       | boolean                        | Disable headless                                                                                                                                          |
| puppeteerOption.slowMo          | no       | number                         | Slow the puppeteer                                                                                                                                        |
| replacements                    | no       | array(object)                  | Allows for replacing some properties in html before parsing. Intended for random parts like urls, tokens, etc. check below for more info                  |
| concurrency                     | no       | number                         | Option to make diffs concurrently (default: 1)                                                                                                            |

### Configuration example

```js
export default {
  candidateBaseUrl: "https://www.new.godt.no",
  currentBaseUrl: "https://www.godt.no",
  headers: {
    Authorization: "Basic <secret-value>", // basic auth authorization
  },
  pathnames: [
    {
      path: "/",
    },
    {
      path: "/om-oss",
    },
    {
      description: "All article types",
      name: "Article",
      note: "Groups all article types",
      pathnames: [
        {
          path: "/aktuelt/i/1Ol0xG/essensielle-ting-til-kjoekkenet",
        },
        {
          description: "Restaurant review",
          path: "/anmeldelser/restaurant/i/lVj0jM/anmeldelse-av-speilsalen",
        },
        {
          path: "/tipstriks/tips/i/V98XV3/hva-gjoer-du-med-den-lille-spiren-i-hvitloeken",
        },
        {
          description: "Inspiration article",
          path: "/inspirasjon/grillmat",
        },
      ],
    },
    {
      path: "/oppskrift/9125/kokeboeker",
    },
    {
      path: "/artikler",
    },
    {
      path: "/kokebok/2236464/baking",
    },
    {
      description: "404 page",
      path: "/adsaDASDas",
    },
    {
      path: "/oppskrifter/grateng/9540/vegansk-sheperd-s-pie",
    },
  ],
  puppeteerOptions: {
    additionalWait: 2000,
    headless: true,
  },
  replacements: {
    "base-url": [
      "https://www.new.godt.no",
      "https://new.godt.no",
      "https://www.godt.no",
      "www.godt.no",
      "new.godt.no",
      "godt.no",
    ],
  },
};
```

### How to use replacements

The `replacements` property allows for replacing some parts of html before parsing. Example:

```js
replacements: {
    'base-url': [
        'https://www.new.example.no',
        'https://new.example.no',
        'https://www.example.no',
        'www.example.no',
        'new.example.no',
        'example.no',
    ],
},
```

Block above will replace all occurences of any url from the list with `base-url` string. This will help with diffing metadata that contains absolute urls. Order of replacements matter, they will be applied from first to the last so place most specific ones first. You will notice what you need to replace when you see the diff report and differences in values you don't care about (e.g. because they are natural for different environments).

### Customizing parsed properties

By default plenty of relevant metadata properties are parsed. If you want to customize which link and meta tags are parsed you may use `parsedMetadata` property in configuration file. Example:

```js
parsedMetadata: {
    linkTags: {
        canonical: false,
    },
},
```

Will disable parsing of link with `rel="canonical"`.

You can also add custom meta tags to be parsed:

```js
parsedMetadata: {
    metaNameTags: {
        'custom-name': true,
    },
},
```

This will add parsing of meta tag with `name="custom-name"`.

Some meta tags use `property` attribute instead of `name`, e.g. Open Graph tags. You may customize them using `metaPropertyTags` property:

```js
parsedMetadata: {
    metaPropertyTags: {
        'og:custom-property': true,
    },
},
```

## TODO

- [ ] fix diff percentage calculation
- [ ] release as a npm package
- [ ] add option to enable/disable redirects, metadata, microdata diff
- [ ] add option to collapse redirects, metadata, microdata sections
- [ ] add response code diff
