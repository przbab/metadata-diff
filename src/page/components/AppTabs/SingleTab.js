export class SingleTab extends HTMLElement {
    constructor() {
        super();
        this.text = this.getAttribute('text');
        this.type = this.getAttribute('type');
        this.handleActivation('current.server-candidate.server');
    }

    connectedCallback() {
        this.root = this.attachShadow({ mode: 'closed' });
        this.render();
        this.root.addEventListener('click', this.handleClick.bind(this));

        window.signals.addEventListener('type', (e) => {
            const newType = e.detail.type;
            this.handleActivation(newType);
            this.render();
        });
    }

    handleActivation(type) {
        if (this.type === type) {
            this.active = true;
        } else {
            this.active = false;
        }
    }

    handleClick(e) {
        e.stopPropagation();
        window.signals.dispatchEvent(new CustomEvent('type', { detail: { type: this.type } }));
    }

    render() {
        this.root.innerHTML = `
<style>
    li {
        cursor: pointer;
        padding: 16px;
        font-family: var(--fonts);
        white-space: nowrap;
    }
    li:hover {
        background-color: var(--secondary-hover-bg-color);
    }
    li.active {
        border-bottom: 1px solid var(--active-color);
        font-weight: bold;
    }
</style>
<li class="${this.active ? 'active' : ''}">
    ${this.text}
    </li>
    `;
    }
}

window.customElements.define('single-tab', SingleTab);
