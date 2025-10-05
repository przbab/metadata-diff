export class ProgressRing extends HTMLElement {
    static get observedAttributes() {
        return ['progress'];
    }

    constructor() {
        super();
        const stroke = this.getAttribute('stroke');
        const radius = this.getAttribute('radius');
        const normalizedRadius = radius - stroke * 2;
        this.circumference = normalizedRadius * 2 * Math.PI;

        this.root = this.attachShadow({ mode: 'open' });
        this.root.innerHTML = `
<div>
    <div>
        <span></span>
    </div>
    <svg
        height="${radius * 2}"
        width="${radius * 2}"
    >
        <circle
            stroke="#EEEEEE"
            stroke-width="${stroke}"
            fill="transparent"
            r="${normalizedRadius}"
            cx="${radius}"
            cy="${radius}"
        />
        <circle
            stroke="#ee6e73"
            stroke-dasharray="${this.circumference} ${this.circumference}"
            style="stroke-dashoffset:${this.circumference}"
            stroke-width="${stroke}"
            fill="transparent"
            r="${normalizedRadius}"
            cx="${radius}"
            cy="${radius}"
        />
    </svg>
</div>

<style>
    div {
        position: relative;
        width: ${radius * 2}px;
        height: ${radius * 2}px;
    }
    div > div {
        position: absolute;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    circle {
        transition: stroke-dashoffset 0.35s;
        transform: rotate(-90deg);
        transform-origin: 50% 50%;
    }
</style>`;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'progress') {
            this.setProgress(newValue);
        }
    }

    setProgress(percent) {
        const offset = this.circumference - (percent / 100) * this.circumference;
        const circle = this.root.querySelector('circle + circle');
        const span = this.root.querySelector('span');
        circle.style.strokeDashoffset = offset;
        span.innerText = `${percent}%`;
    }
}

window.customElements.define('progress-ring', ProgressRing);
