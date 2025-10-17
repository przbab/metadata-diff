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
        this.showUnchanged = true;
        this.showMissingData = false;
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
        window.signals.addEventListener('set-show-unchanged', (e) => {
            this.showUnchanged = e.detail.showUnchanged;
            this.renderData();
        });
        window.signals.addEventListener('set-show-missing-data', (e) => {
            this.showMissingData = e.detail.showMissingData;
            this.renderData();
        });
    }

    getHtml(delta, source) {
        if (delta) {
            return format(delta, source);
        }

        if (this.hasData(source)) {
            return `<span>No data</span>`;
        }

        if (this.showUnchanged) {
            return `<pre>${JSON.stringify(source, null, 4)}</pre>`;
        }

        return `<span>No changes</span>`;
    }

    hasData(data) {
        return (
            !data ||
            (Array.isArray(data) && data.length === 0) ||
            (typeof data === 'object' && Object.keys(data).length === 0)
        );
    }

    renderData() {
        if (this.state.pathnames) {
            this.root.innerHTML = `
<style>
    h2 {
        margin-top: 0;
    }
</style>
<div>
    <h2>${this.state.name}</h2>
    ${this.state.note ? `<p>${this.state.note}</p>` : ''}
</div>
`;

            return;
        }
        if (!this.state.diffs) {
            this.root.innerHTML = `<span>Loading...</span>`;

            return;
        }

        const [sourceString] = this.type.split('-');
        const [sourceEnv, sourceType] = sourceString.split('.');

        const sourceData = this.state[sourceEnv][sourceType];
        const { jsonLdDelta, metadataDelta, microdataDelta, redirectsDelta } = this.state.diffs[this.type];

        const redirectsHtml = this.getHtml(redirectsDelta, sourceData.redirects);
        const jsonLdHtml = this.getHtml(jsonLdDelta, sourceData.jsonLd);
        const metadataHtml = this.getHtml(metadataDelta, sourceData.metadata);
        const microdataHtml = this.getHtml(microdataDelta, sourceData.microdata);

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
<div class="diff-container ${this.showUnchanged ? '' : 'jsondiffpatch-unchanged-hidden'}">
    <h2>Path: ${this.state.path}</h2>
    ${this.state.notes ? `<p>${this.state.notes}</p>` : ''}
    ${this.shouldShowSection(sourceData.redirects) ? `<h3>Redirects:</h3>${redirectsHtml}` : ''}
    ${this.shouldShowSection(sourceData.metadata) ? `<h3>Metadata:</h3>${metadataHtml}` : ''}
    ${this.shouldShowSection(sourceData.jsonLd) ? `<h3>JSON-LD:</h3>${jsonLdHtml}` : ''}
    ${this.shouldShowSection(sourceData.microdata) ? `<h3>Microdata:</h3>${microdataHtml}` : ''}
</div>
`;
    }

    shouldShowSection(data) {
        return !this.showMissingData && !this.hasData(data);
    }
}

window.customElements.define('data-diff', Diff);
