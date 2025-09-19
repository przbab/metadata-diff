# Metadata diff

## Configuration

Configuration will be validated against model described in [configuration file section](#configuration-file). The main way to configure library is throught configuration file. Cli options allow for setting configuration file and log level.

### Configuration file

Configuration is read using js `import` statement, so it may be a `.js` or `.json` file. The path to the configuration file may be set using `--config` or `-c` cli option.

| Property name                  | Required | Type                           | Description                                                                                                                                               |
| ------------------------------ | -------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| currentBaseUrl                 | yes      | string                         | Origin of _current_ host                                                                                                                                  |
| candidateBaseUrl               | yes      | string                         | Origin of _candidate_ host                                                                                                                                |
| headers                        | no       | object                         | Additional headers to be sent with each request, useful for custom user agent or authentication                                                           |
| minify                         | no       | boolean                        | Should the report be minified (Default: `true`)                                                                                                           |
| output                         | no       | string                         | Path for the output file (Default: `metadataDiffReport.html`)                                                                                             |
| pathnames                      | yes      | array(string) OR array(object) | Array of pathnames to be tested                                                                                                                           |
| pathnames.path                 | yes      | string                         | Pathname to be tested                                                                                                                                     |
| pathnames.note                 | no       | string                         | Optional note for the pathname                                                                                                                            |
| puppeteerOption                | no       | object                         |
| puppeteerOption.additionalWait | no       | number                         | By setting this property you may give puppeteer some timeout to increase the chance of completing js tasks. (Default: `0`)                                |
| puppeteerOption.blockRequests  | no       | array(string)                  | Array of regular expressions that will be matched against outgoing requests and cancelling matched. Intended for ads, tracking, etc.                      |
| puppeteerOption.goto           | no       | object                         | This property will be passed to puppeteer's `page.goto` as options. https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagegotourl-options |
| puppeteerOption.headless       | no       | boolean                        | Disable headless                                                                                                                                          |
| puppeteerOption.slowMo         | no       | number                         | Slow the puppeteer                                                                                                                                        |
| replaceBaseUrls                | no       | boolean                        | Should base url be replaced with string (to simplify comparison) (Default: `true`)                                                                        |
| replacements                   | no       | array(object)                  | Allows for replacing some properties in html before parsing. Intended for random parts like tokens, etc,                                                  |
| replacements.flags             | no       | string                         | Flags for the expression                                                                                                                                  |
| replacements.regExp            | yes      | string                         | Regular expression                                                                                                                                        |
| replacements.replace           | yes      | string                         | Replacement                                                                                                                                               |
| concurrency                    | no       | number                         | Option to make diffs concurrently (default: 1)                                                                                                            |

### Command line

Usage: metadata-diff.js [options]

| Options       | Type    | Description                                                                         |
| ------------- | ------- | ----------------------------------------------------------------------------------- |
| --config, -c  | string  | Specify configuration file to use                                                   |
| --logLevel    | string  | Log level (avaliable options: `error`, `warn`, `info`, `verbose`, `debug`, `silly`) |
| --logToFile   | boolean | Save log to file                                                                    |
| --logFilename | string  | Log filename                                                                        |
| --help, -h    | boolean | Show help                                                                           |
| --version, -v | boolean | Show version number                                                                 |

## TODO

- [ ] a better usage manual with examples
- [ ] add option to customize list of parsed properties
- [ ] improve UI and UX
- [ ] release as npm package
- [ ] add option to enable/disable redirects, metadata, microdata diff
- [ ] add option to collapse redirects, metadata, microdata sections
- [ ] add response code diff
