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

</style>
<dialog closedby="any">
    <input type="checkbox" id="show-unchanged-checkbox" checked/>
    <label for="show-unchanged-checkbox">Show Unchanged</label>
    <form method="dialog">
        <button>OK</button>
    </form>
</dialog>
`;
        const showUnchanged = this.root.querySelector('#show-unchanged-checkbox');
        showUnchanged.addEventListener('change', (e) => {
            window.signals.dispatchEvent(
                new CustomEvent('set-show-unchanged', { detail: { showUnchanged: e.target.checked } })
            );
        });
    }

    showDialog() {
        const dialog = this.root.querySelector('dialog');
        dialog.showModal();
    }
}

window.customElements.define('settings-dialog', SettingsDialog);
