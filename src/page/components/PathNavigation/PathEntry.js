import { getDiffDataByPath } from '../../utils/getDiffDataByPath.js';
import '../Icons/FileIcon.js';
import '../Icons/FolderClosedIcon.js';
import '../Icons/FolderOpenIcon.js';

export class PathEntry extends HTMLElement {
    constructor() {
        super();
        this.name = this.getAttribute('name');
        this.icon = this.getAttribute('icon');
        this.description = this.getAttribute('description');
        this.depth = this.getAttribute('depth');
        this.path = this.getAttribute('path');
        this.type = 'current.server-candidate.server';
    }

    connectedCallback() {
        this.root = this.attachShadow({ mode: 'closed' });
        this.state = getDiffDataByPath(this.path);

        this.render();

        window.signals.addEventListener('diff', (e) => {
            const { path } = e.detail;
            if (this.path === path) {
                this.render();
            }
        });
        window.signals.addEventListener('type', (e) => {
            this.type = e.detail.type;
            this.render();
        });
    }

    getIcon() {
        if (this.icon === 'file') {
            return `<file-icon></file-icon>`;
        }
        if (this.icon === 'folder') {
            return `<folder-open-icon></folder-open-icon>`;
        }

        return '';
    }

    render() {
        const diffs = this.state.diffs?.[this.type];
        const diffCount = diffs
            ? Object.keys(diffs.jsonLdDelta ?? {}).filter((key) => key !== '_t').length +
              Object.keys(diffs.metadataDelta ?? {}).filter((key) => key !== '_t').length +
              Object.keys(diffs.microdataDelta ?? {}).filter((key) => key !== '_t').length +
              Object.keys(diffs.redirectsDelta ?? {}).filter((key) => key !== '_t').length
            : null;
        console.log('🚀 ~ PathEntry ~ render ~ diffCount:', {
            diffCount,
            diffs,
            "Object.keys(diffs?.?jsonLdDelta ?? {}).filter((key) => key !== '_t').length": Object.keys(
                diffs?.jsonLdDelta ?? {}
            ).filter((key) => key !== '_t').length,
            'Object.keys(diffs?.jsonLdDelta ?? {}).length': Object.keys(diffs?.jsonLdDelta ?? {}).length,
            "Object.keys(diffs?.metadataDelta ?? {}).filter((key) => key !== '_t').length": Object.keys(
                diffs?.metadataDelta ?? {}
            ).filter((key) => key !== '_t').length,

            'Object.keys(diffs?.metadataDelta ?? {}).length': Object.keys(diffs?.metadataDelta ?? {}).length,
            "Object.keys(diffs?.microdataDelta ?? {}).filter((key) => key !== '_t').length": Object.keys(
                diffs?.microdataDelta ?? {}
            ).filter((key) => key !== '_t').length,
            'Object.keys(diffs?.microdataDelta ?? {}).length': Object.keys(diffs?.microdataDelta ?? {}).length,
            "Object.keys(diffs?.redirectsDelta ?? {}).filter((key) => key !== '_t').length": Object.keys(
                diffs?.redirectsDelta ?? {}
            ).filter((key) => key !== '_t').length,
            'Object.keys(diffs?.redirectsDelta ?? {}).length': Object.keys(diffs?.redirectsDelta ?? {}).length,
            path: this.path,
            state: this.state,
            type: this.type,
        });

        this.root.innerHTML = `
<style>
.root {
    font-family: var(--fonts);
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
}
.root:hover {
    background-color: var(--secondary-hover-bg-color);
}
.text-container {
    display: flex;
    flex-direction: column;
}
span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: ${285 - 24 * this.depth}px;
}
.description {
    color: var(--secondary-text-color);
}
.footnote {
    display: flex;
    font-size: 0.9em;
    gap: 8px;
}
.badge {
    background-color: var(--active-color);
    color: white;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
}
</style>
<div class="root">
    ${this.getIcon()}
    <div class="text-container">
        <span>${this.name}</span>
        <div class="footnote">
        ${diffCount !== null && diffCount > 0 ? `<div class="badge">${diffCount}</div>` : ''}
            <span class="description">${this.description ?? ''}</span>
        </div>
    </div>
</div>
`;
    }
}

window.customElements.define('path-entry', PathEntry);
