# Metadata diff

## Configuration

Configuration will be validated against model described in [configuration file section](#configuration-file). The main way to configure library is throught configuration file. Cli options allow for some quick overrides. When using this project as a library you can turn off configuration file and pass your own configuration.

### Configuration file

By default configuration should be in one of the `.metadatadiffrc`, `.metadatadiffrc.json`, `.metadatadiffrc.js` file. You can also put configuration in `package.json` under `metadataDiff` property.

Property name | Required | Type | Description
--- | --- | --- | ---
currentBaseUrl | yes | string | Origin of *current* host
candidateBaseUrl | yes | string | Origin of *candidate* host
environment | no | object | Allows for altering config for given environment taken from `METADATA_DIFF_ENV` or `NODE_ENV` defaulting to `development`. E.g. `{ "development": { "candidateBaseUrl": "http://localhost:3000" } }`
html | no | string | Path to the ejs template file
minify | no | boolean | Should the report be minified (Default: `true`)
output | no | string | Path for the output file (Default: `metadataDiffReport.html`)
pathnames | yes | array(string) OR array(object) | Array of pathnames to be tested
pathnames.path | yes | string | Pathname to be tested
pathnames.note | no | string | Optional note for the pathname
puppeteerOption | no | object |
puppeteerOption.additionalWait | no | number | By setting this property you may give puppeteer some timeout to increase the chance of completing js tasks. (Default: `0`)
puppeteerOption.blockRequests | no | array(string) |  Array of regular expressions that will be matched against outgoing requests and cancelling matched. Intended for ads, tracking, etc.
puppeteerOption.goto | no | object | This property will be passed to puppeteer's `page.goto` as options. https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagegotourl-options
puppeteerOption.headless | no | boolean | Disable headless
puppeteerOption.slowMo | no | number | Slow the puppeteer
replaceBaseUrls | no | boolean | Should base url be replaced with string (to simplify comparison) (Default: `true`)
replacements | no | array(object) | Allows for replacing some properties in html before parsing. Intended for random parts like tokens, etc,
replacements.flags | no | string | Flags for the expression
replacements.regExp | yes | string | Regular expression
replacements.replace | yes | string | Replacement
scripts | no | string | Path to the script file. This file will be included in report.
styles | no | string | Path to the style file. This file will be included in report.
userAgent | no | string | User agent (Default: `metadata-diff`)
logLevel | no | string | Log level (avaliable options: `error`, `warn`, `info`, `verbose`, `debug`, `silly`)
logToFile | no | boolean | Save log to file
logFilename | no | string | Log filename
concurrency | no | number | Option to make diffs concurrently (default: 1)

### Command line

Usage: metadata-diff.js [options]

Options | Type | Description
--- | --- | ---
--config, -c | string | Specify configuration file to use
--output, -o | string | Specify file to write report to
--minify, -m | boolean | Override minify option
--currentBaseUrl, --current, -p | string | Override currentBaseUrl
--candidateBaseUrl, --candidate, -b | string | Override candidateBaseUrl
--concurrency | number | Option to make diffs concurrently
--logToFile, -l | boolean | Save log to file
--logFilename | string | Log filename
--help, -h | boolean | Show help
--version, -v | boolean | Show version number

### Using as library

Library exposes 3 functions `diff`, `full`, `report`. Function `full` is a composition of `diff` and `report`. The result of function `diff` is a list of diffed pathnames, this result is then passed to fuction `report` to generate the report. The configuration is the same as in [configuration file]((#configuration-file)
), but 2 additional properties are possible.

Property name | Type | Description
--- | --- | ---
config | string | Specify configuration file to use
skipConfig | boolean | Omit configuration file reading

## TODO

- [ ] usage manual
- [ ] release as npm package
- [ ] make puppeteer a peer dependency (https://github.com/GoogleChrome/puppeteer/issues/288)
- [ ] add option to enable/disable redirects, metadata, microdata diff
- [ ] add option to collapse redirects, metadata, microdata sections
- [ ] add response code diff
