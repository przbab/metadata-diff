import '../Icons/CrossIcon.js';

export class SettingsDialog extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.root = this.attachShadow({ mode: 'closed' });

        window.signals.addEventListener('open-settings-dialog', () => {
            this.showDialog();
        });

        this.root.innerHTML = `
<style>
dialog {
    max-height: clamp(300px, 80vh, 800px);
    max-width: min(800px, 85vw);
    width: 100%;
    border-radius: 12px;
    box-shadow: 0px 0px 0px 1px #d1d9e080, 0px 6px 12px -3px #25292e0a, 0px 6px 18px 0px #25292e1f;
    background-color: var(--primary-bg-color);
    border: 1px solid var(--divider-color);
    padding: 0;
    font-family: var(--fonts);
}
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    border-bottom: 1px solid var(--divider-color);
    font-weight: 600;
}
button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    width: 32px;
    height: 32px;
}
.content {
    padding: 16px 8px;
    display: flex;
    flex-direction: column;
}
</style>
<dialog closedby="any">
    <div class="header">
        <span>Settings</span>
        <form method="dialog">
            <button>
                <cross-icon></cross-icon>
            </button>
        </form>
    </div>
    <div class="content">
        <div>
            <input type="checkbox" id="show-unchanged-checkbox" checked/>
            <label for="show-unchanged-checkbox">Show Unchanged</label>
        </div>
        <div>
            <input type="checkbox" id="show-missing-data-checkbox"/>
            <label for="show-missing-data-checkbox">Show Missing Data</label>
        </div>
    </div>
</dialog>
`;
        const showUnchanged = this.root.querySelector('#show-unchanged-checkbox');
        showUnchanged.addEventListener('change', (e) => {
            window.signals.dispatchEvent(
                new CustomEvent('set-show-unchanged', { detail: { showUnchanged: e.target.checked } })
            );
        });
        const showMissingData = this.root.querySelector('#show-missing-data-checkbox');
        showMissingData.addEventListener('change', (e) => {
            window.signals.dispatchEvent(
                new CustomEvent('set-show-missing-data', { detail: { showMissingData: e.target.checked } })
            );
        });
    }

    showDialog() {
        const dialog = this.root.querySelector('dialog');
        dialog.showModal();
    }
}

window.customElements.define('settings-dialog', SettingsDialog);
