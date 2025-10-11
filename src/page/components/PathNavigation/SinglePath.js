import './PathEntry.js';

const styles = `
<style>

</style>
`;

export class SinglePath extends HTMLElement {
    constructor() {
        super();
        this.name = this.getAttribute('name');
        this.path = this.getAttribute('path');
        this.type = this.getAttribute('type');
        this.icon = this.getAttribute('icon');
        this.depth = this.getAttribute('depth');
        this.description = this.getAttribute('description');
    }

    connectedCallback() {
        const shadow = this.attachShadow({ mode: 'closed' });

        if (this.icon === 'file') {
            shadow.innerHTML = `
${styles}
<li>
    <path-entry name="${this.name}" depth="${this.depth}" icon="file" description="${this.description}"></path-entry>
</li>`;
        } else if (this.icon === 'folder') {
            shadow.innerHTML = `
${styles}
<li>
    <path-entry name="${this.name}" depth="${this.depth}"icon="folder" description="${this.description}"></path-entry>
    <path-navigation depth="${this.depth}" depth="${this.depth}" type="${this.type}" path="${this.path}"></path-navigation>
</li>`;
        }

        shadow.addEventListener('click', this.handleClick.bind(this));
    }

    handleClick(e) {
        e.stopPropagation();
        window.signals.dispatchEvent(new CustomEvent('navigate', { detail: { name: this.name, path: this.path } }));
    }
}

window.customElements.define('single-path', SinglePath);
