function getDiffDataByPath(path) {
    return path
        .replace(/^root./, '')
        .split('.')
        .reduce((acc, part, index, array) => {
            if (index === array.length - 1) {
                return acc[part];
            }

            return acc[part].pathnames;
        }, window.DIFF_DATA.diffs);
}

export class Diff extends HTMLElement {
    constructor() {
        super();
        this.path = 'root.0';
        this.type = 'current.server-candidate.server';
        this.state = getDiffDataByPath(this.path);
        this.root = this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.renderData();

        window.signals.addEventListener('navigate', (e) => {
            this.path = e.detail.path;
            this.state = getDiffDataByPath(this.path);
            this.renderData();
        });
        window.signals.addEventListener('type', (e) => {
            this.type = e.detail.type;
            this.renderData();
        });
    }

    renderData() {
        const [sourceString, targetString] = this.type.split('-');
        const [sourceEnv, sourceType] = sourceString.split('.');
        const [targetEnv, targetType] = targetString.split('.');

        const sourceData = this.state[sourceEnv][sourceType];
        const targetData = this.state[targetEnv][targetType];

        const redirectsDelta = jsondiffpatch.diff(sourceData.redirects, targetData.redirects);
        const jsonLdDelta = jsondiffpatch.diff(sourceData.jsonLd, targetData.jsonLd);
        const metadataDelta = jsondiffpatch.diff(sourceData.metadata, targetData.metadata);
        const microdataDelta = jsondiffpatch.diff(sourceData.microdata, targetData.microdata);

        const redirectsHtml = redirectsDelta
            ? jsondiffpatch.formatters.html.format(redirectsDelta, sourceData.redirects)
            : `<pre>${JSON.stringify(sourceData.redirects, null, 4)}</pre>`;
        const jsonLdHtml = jsonLdDelta
            ? jsondiffpatch.formatters.html.format(jsonLdDelta, sourceData.jsonLd)
            : `<pre>${JSON.stringify(sourceData.jsonLd, null, 4)}</pre>`;
        const metadataHtml = metadataDelta
            ? jsondiffpatch.formatters.html.format(metadataDelta, sourceData.metadata)
            : `<pre>${JSON.stringify(sourceData.metadata, null, 4)}</pre>`;
        const microdataHtml = microdataDelta
            ? jsondiffpatch.formatters.html.format(microdataDelta, sourceData.microdata)
            : `<pre>${JSON.stringify(sourceData.microdata, null, 4)}</pre>`;

        this.root.innerHTML = `
<style>
    h2 {
        margin-top: 0;
    }
</style>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/jsondiffpatch/dist/formatters-styles/html.css" type="text/css" />
<h2>Path: ${this.state.path}</h2>
${this.state.notes ? `<p>${this.state.notes}</p>` : ''}
<h3>Redirects:</h3>
${redirectsHtml}
<h3>JSON-LD:</h3>
${jsonLdHtml}
<h3>Metadata:</h3>
${metadataHtml}
<h3>Microdata</h3>
${microdataHtml}
`;
    }
}

window.customElements.define('data-diff', Diff);

// TODO function handleUnchangedSwitch(event) {
//     if (event.target.checked) {
//         jsondiffpatch.formatters.html.showUnchanged();
//     } else {
//         jsondiffpatch.formatters.html.hideUnchanged();
//     }
// }
