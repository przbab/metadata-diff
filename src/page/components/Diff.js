// eslint-disable-next-line import/no-unresolved
import { format } from 'jsondiffpatch/formatters/html';
import { getDiffDataByPath } from '../utils/getDiffDataByPath.js';

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
        window.signals.addEventListener('diff', (e) => {
            const { path, type } = e.detail;
            if (this.path === path && this.type === type) {
                this.renderData();
            }
        });
    }

    renderData() {
        const [sourceString] = this.type.split('-');
        const [sourceEnv, sourceType] = sourceString.split('.');

        const sourceData = this.state[sourceEnv][sourceType];

        if (!this.state.diffs) {
            this.root.innerHTML = `<span>Loading...</span>`;

            return;
        }

        const { jsonLdDelta, metadataDelta, microdataDelta, redirectsDelta } = this.state.diffs[this.type];

        const redirectsHtml = redirectsDelta
            ? format(redirectsDelta, sourceData.redirects)
            : `<pre>${JSON.stringify(sourceData.redirects, null, 4)}</pre>`;
        const jsonLdHtml = jsonLdDelta
            ? format(jsonLdDelta, sourceData.jsonLd)
            : `<pre>${JSON.stringify(sourceData.jsonLd, null, 4)}</pre>`;
        const metadataHtml = metadataDelta
            ? format(metadataDelta, sourceData.metadata)
            : `<pre>${JSON.stringify(sourceData.metadata, null, 4)}</pre>`;
        const microdataHtml = microdataDelta
            ? format(microdataDelta, sourceData.microdata)
            : `<pre>${JSON.stringify(sourceData.microdata, null, 4)}</pre>`;

        this.root.innerHTML = `
<style>
    h2 {
        margin-top: 0;
    }
    .diff-container {
        overflow-x: auto;
    }
</style>
<link rel="stylesheet" href="jsondiffpatch.css" type="text/css" />
<div class="diff-container">
    <h2>Path: ${this.state.path}</h2>
    ${this.state.notes ? `<p>${this.state.notes}</p>` : ''}
    <h3>Redirects:</h3>
    ${redirectsHtml}
    <h3>Metadata:</h3>
    ${metadataHtml}
    <h3>JSON-LD:</h3>
    ${jsonLdHtml}
    <h3>Microdata</h3>
    ${microdataHtml}
</div>
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
