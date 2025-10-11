export class AppHeader extends HTMLElement {
    constructor() {
        super();
        this.name = this.getAttribute('name');
        this.currentUrl = window.DIFF_DATA.currentBaseUrl;
        this.candidateUrl = window.DIFF_DATA.candidateBaseUrl;
    }

    connectedCallback() {
        window.signals.addEventListener('navigate', this.handleNavigation.bind(this));
        this.root = this.attachShadow({ mode: 'closed' });
        this.render('/');
    }

    disconnectedCallback() {
        window.signals.removeEventListener('navigate', this.handleNavigation);
    }

    handleNavigation(e) {
        const path = e.detail.name;

        this.render(path);
    }

    render(path) {
        this.root.innerHTML = `
<style>
    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: var(--header-bg-color);
        color: var(--header-text-color);
        padding: 16px;
        font-family: var(--fonts);
    }
    h1 {
        margin: 0;
        font-family: var(--fonts);
    }
    .links {
        display: flex;
        flex-direction: column;
    }
    span {
        font-family: var(--fonts);
    }
    a {
        color: var(--primary-text-active-color);
        font-family: var(--fonts);
    }
    @media only screen and (width <= 780px) {
        header {
            padding: 8px;
        }
        h1 {
            font-size: 24px;
        }
        a span {
            display: none;
        }
    }
</style>
<header>
    <h1>Metadata Diff</h1>
    <div class="links">
        <span><a href="${this.currentUrl}${path}">Current<span>: ${this.currentUrl}</span></a></span>
        <span><a href="${this.candidateUrl}${path}">Candidate<span>: ${this.candidateUrl}</span></a></span>
    </div>
    <div>
    <!--
        <span><input type="checkbox" id="show-unchanged" checked> Show unchanged</span>
        -->
    </div>
</header>
`;
    }
}

window.customElements.define('app-header', AppHeader);
