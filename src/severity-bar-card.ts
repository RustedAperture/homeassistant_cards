import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('severity-bar-card')
export class SeverityBarCard extends LitElement {
  @property({ attribute: false }) public hass!: any;
  @property({ attribute: false }) private _config: any = {};

  static getStubConfig() {
    return {
      entity: 'sensor.example',
      name: 'Example',
      icon: 'mdi:chart-line',
      min: 0,
      max: 100,
      severity: [
        { color: '#2ecc71', from: 0, to: 50 },
        { color: '#e74c3c', from: 51, to: 100 },
      ],
    };
  }

  setConfig(config: any) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this._config = config;
  }

  getCardSize() {
    return 2;
  }

  getGridOptions() {
    return {
      rows: 1,
      columns: 6,
      min_rows: 1,
    };
  }

  render() {
    return html`<div class="card">Severity Bar Card</div>`;
  }

  static styles = css`
    :host {
      display: block;
    }
    .card {
      padding: 16px;
    }
  `;
}

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'severity-bar-card',
  name: 'Severity Bar Card',
  description: 'A card with icon, value, and gradient severity progress bar',
});
