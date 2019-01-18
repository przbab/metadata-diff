# Metadata diff

## Configuration

You can use any way to configure the report, the merged configuration will be validated against model described in [configuration file section](#configuration-file).

### Configuration file

By default configuration should be in one of the `.metadatadiffrc`, `.metadatadiffrc.json`, `.metadatadiffrc.js` file. You can also put configuration in `package.json` under `metadataDiff` property.

Property name | Required | Type | Default value | Description
--- | --- | --- | --- | ---
currentBaseUrl | yes | string | | Origin of *current* host
candidateBaseUrl | yes | string | | Origin of *candidate* host
environment | no | object | `{}` | Allows for altering config for given environment taken from `METADATA_DIFF_ENV` or`NODE_ENV` defaulting to `development`. E.g. `{ "development": { "candidateBaseUrl": "http://localhost:3000" } }`
html | no | string | `./src/page/index.html` | Path to the template html file
minify | no | boolean | `true` | Should the report be minified
output | no | string | `metadataDiffReport.html` | Path for the output file
pathnames | yes | array(string) | | Array of pathnames to be tested
puppeteerOption | no | object | `{}` |
puppeteerOption.additionalWait | no | number | `0` | By setting this property you may give puppeteer some timeout to increase the chance of completing js tasks.
puppeteerOption.blockRequests | no | array(string) | `[]` | Array of regular expressions that will be matched against outgoing requests and cancelling matched. Intended for ads, tracking, etc.
puppeteerOption.goto | no | object | `{}` | This property will be passed to puppeteer's `page.goto` as options. https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagegotourl-options
replaceBaseUrls | no | boolean | `true` | Should base url be replaced with string (to simplify comparison)
replacements | no | array(object) | `[]` | Allows for replacing some properties in html before parsing. Intended for random parts like tokens, etc,
replacements.flags | no | string | `''` |
replacements.regExp | yes | string | | Regular expression
replacements.replace | yes | string | | Replacement
scripts | no | string | `./src/page/scripts.js` | Path to the script file. This file will be included in report.
styles | no | string | `./src/page/styles.css` | Path to the style file. This file will be included in report.
userAgent | no | string | `metadata-diff` | User agent

### Command line

Usage: metadata-diff.js [options]

Options | Type | Description
--- | --- | ---
--config, -c | string | Specify configuration file to use
--output, -o | string | Specify file to write report to
--minify, -m | boolean | Override minify option
--currentBaseUrl, --current, -p | string | Override currentBaseUrl
--candidateBaseUrl, --candidate, -b | string | Override candidateBaseUrl
--help, -h | boolean | Show help
--version, -v | boolean | Show version number

### Using as library

Functions `diff` and `full` require full configuration. The configuration is the same as in [configuration file]((#configuration-file)
), but 2 additional properties are possible.

Property name | Type | Description
--- | --- | ---
config | string | Specify configuration file to use
skipConfig | boolean | Omit configuration file reading

## TODO

- [ ] proper readme
- [ ] usage manual
- [ ] add tests
- [x] add timeout to puppeteer to let js finish the job
- [x] remove microdata from metadata
- [x] make current and candidate addresses match each other
- [x] add option to hide identical fields
- [x] add config file support (e.g. .metadiffrc)
- [x] add option to override config file location
- [x] add config validation
- [x] add option for multiple environments
- [x] add date of the test
- [x] show redirects
- [x] display current and candidate addresses
- [ ] add error handling
- [ ] indicate if there is no data
- [ ] indicate if all data is identical
- [x] add option to jump to the diff urls
- [ ] release as npm package
- [ ] allow concurrent diffs
- [ ] redesign the report look
- [ ] allow for report customization
- [x] indicate percentage differences
- [ ] sort by percentage differences
- [ ] make puppeteer a peer dependency (https://github.com/GoogleChrome/puppeteer/issues/288)
- [ ] add option to comment pathname (notes)
- [ ] update `uglify-es` to [terser](https://github.com/terser-js/terser)
- [ ] add YAML configuration file support
- [ ] JSON-LD support