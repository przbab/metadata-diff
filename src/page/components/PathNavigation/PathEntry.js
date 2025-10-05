import './FileIcon.js';
import './FolderClosedIcon.js';
import './FolderOpenIcon.js';

export class PathEntry extends HTMLElement {
    constructor() {
        super();
        this.name = this.getAttribute('name');
        this.icon = this.getAttribute('icon');
        this.description = this.getAttribute('description');
        this.depth = this.getAttribute('depth');
    }

    connectedCallback() {
        const shadow = this.attachShadow({ mode: 'closed' });

        shadow.innerHTML = `
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
        font-size: 0.9em;
    }
</style>
<div class="root">
    ${this.getIcon()}
    <div class="text-container">
        <span>${this.name}</span>
        ${this.description ? `<span class="description">${this.description}</span>` : ''}
    </div>
</div>
`;
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
}

window.customElements.define('path-entry', PathEntry);
