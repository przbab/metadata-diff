import './SingleTab.js';

export class AppTabs extends HTMLElement {
    constructor() {
        super();
        this.name = this.getAttribute('name');
        this.currentUrl = window.DIFF_DATA.currentBaseUrl;
        this.candidateUrl = window.DIFF_DATA.candidateBaseUrl;
    }

    connectedCallback() {
        this.root = this.attachShadow({ mode: 'closed' });
        this.root.innerHTML = `
<style>
    ul {
        list-style: none;
        padding: 0 8px;
        display: flex;
        gap: 16px;
        margin: 0;
        background-color: var(--secondary-bg-color);
        max-width: 100vw;
        overflow-x: auto;
    }
</style>
<ul>
    <single-tab text="Current server => Candidate server" type="current.server-candidate.server"></single-tab>
    <single-tab text="Current client => Candidate client" type="current.client-candidate.client"></single-tab>
    <single-tab text="Candidate server => Candidate client" type="candidate.server-candidate.client"></single-tab>
</ul>
`;
    }
}

window.customElements.define('app-tabs', AppTabs);
