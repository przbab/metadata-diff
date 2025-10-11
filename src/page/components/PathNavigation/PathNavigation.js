import './SinglePath.js';

function getDiffDataByPath(path) {
    if (path === 'root') {
        return window.DIFF_DATA.diffs;
    }

    return path
        .replace(/^root./, '')
        .split('.')
        .reduce((acc, part) => acc[part].pathnames, window.DIFF_DATA.diffs);
}

export class PathNavigation extends HTMLElement {
    static get observedAttributes() {
        return ['type', 'path'];
    }

    constructor() {
        super();
        this.path = this.getAttribute('path');
        this.state = getDiffDataByPath(this.path);
        this.depth = this.getAttribute('depth') || '0';
    }

    connectedCallback() {
        const shadow = this.attachShadow({ mode: 'closed' });

        shadow.innerHTML = `
<style>
    ul {
        list-style: none;
        margin: 0;
        padding-left: ${this.depth === '0' ? '0' : '16px'};
    }
</style>
<ul class="site-list">
    ${this.state
        .map(
            (item, index) =>
                `<single-path name="${item.path || item.name}" path="${this.path}.${index}" depth="${+this.depth + 1}" icon="${item.pathnames ? 'folder' : 'file'}" description="${item.description ?? ''}"></single-path>`
        )
        .join('')}
</ul>`;
    }
}

window.customElements.define('path-navigation', PathNavigation);
