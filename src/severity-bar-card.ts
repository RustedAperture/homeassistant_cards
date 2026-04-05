import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('severity-bar-card')
export class SeverityBarCard extends LitElement {
  public hass!: any;
  private _config: any = {};

  static get properties() {
    return {
      hass: { type: Object },
      _config: { type: Object },
    };
  }

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
    if (!this.hass || !this._config?.entity) {
      return html`<ha-card class="card">Loading...</ha-card>`;
    }

    const stateObj = this.hass.states[this._config.entity];
    const state = stateObj ? parseFloat(stateObj.state) : NaN;
    const isUnavailable = isNaN(state);

    const name = this._config.name || stateObj?.attributes?.friendly_name || this._config.entity;
    const icon = this._config.icon || 'mdi:chart-line';

    return html`
      <ha-card
        class="card"
        @mouseenter="${this._handleHover}"
        @mouseleave="${this._handleHoverEnd}"
      >
        <div class="content">
          <div class="icon" style="background-color: ${this._getSeverityBgColor(state)}; color: ${this._getSeverityColor(state)};">
            <ha-icon .icon="${icon}"></ha-icon>
          </div>
          <div class="right">
            <div class="name">${name}</div>
            <div class="value-row">
              <span class="value" style="color: ${this._getSeverityColor(state)};">
                ${isUnavailable ? 'N/A' : state.toFixed(1)}
              </span>
              <div class="bar-container">
                <div class="bar-background"></div>
                <div
                  class="bar-fill"
                  style="
                    width: ${isUnavailable ? '0%' : this._getFillPercent(state)}%;
                    background: ${this._getGradient()};
                  "
                ></div>
              </div>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }
    .card {
      padding: 12px 16px;
      cursor: pointer;
      transition: background-color 0.05s;
    }
    .content {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .icon ha-icon {
      --mdc-icon-size: 20px;
    }
    .right {
      flex: 1;
      min-width: 0;
    }
    .name {
      font-family: Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.1px;
      line-height: 20px;
      margin-bottom: 6px;
    }
    .value-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .value {
      font-family: Roboto, Noto, sans-serif;
      font-size: 12px;
      font-weight: 400;
      letter-spacing: 0.4px;
      line-height: 16px;
      flex-shrink: 0;
      min-width: 30px;
    }
    .bar-container {
      flex: 1;
      position: relative;
      height: 14px;
      border-radius: 8px;
      overflow: hidden;
    }
    .bar-background {
      position: absolute;
      inset: 0;
      background: rgba(128, 128, 128, 0.15);
      border-radius: 8px;
    }
    .bar-fill {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      border-radius: 8px;
      transition: width 0.3s ease;
    }
  `;

  private _handleHover(ev: MouseEvent) {
    const card = (ev.target as HTMLElement).closest('ha-card');
    if (!card) return;
    const stateObj = this.hass?.states[this._config?.entity];
    const state = stateObj ? parseFloat(stateObj.state) : NaN;
    const color = this._getSeverityColor(state);
    if (isNaN(state)) {
      card.style.backgroundColor = 'rgba(200,200,200, 0.02)';
    } else {
      card.style.backgroundColor = `${color.replace('rgb', 'rgba').replace(')', ', 0.02)')}`;
    }
  }

  private _handleHoverEnd(ev: MouseEvent) {
    const card = (ev.target as HTMLElement).closest('ha-card');
    if (card) card.style.backgroundColor = '';
  }

  private _getSeverityColor(value: number): string {
    const severity = this._getMatchingSeverity(value);
    return severity ? severity.color : 'rgb(200, 200, 200)';
  }

  private _getSeverityBgColor(value: number): string {
    const hex = this._getSeverityColor(value);
    // Convert hex to rgba with 0.2 alpha
    if (hex.startsWith('#')) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.2)`;
    }
    // Already rgb format
    return hex.replace('rgb', 'rgba').replace(')', ', 0.2)');
  }

  private _getFillPercent(value: number): string {
    const min = this._config.min ?? 0;
    const max = this._config.max ?? 100;
    const clamped = Math.max(min, Math.min(max, value));
    return String(((clamped - min) / (max - min)) * 100);
  }

  private _getGradient(): string {
    const severity = this._config.severity;
    if (!severity || !Array.isArray(severity) || severity.length === 0) {
      return 'rgba(128, 128, 128, 0.3)';
    }

    const min = this._config.min ?? 0;
    const max = this._config.max ?? 100;
    const range = max - min;

    const stops: string[] = [];

    for (const s of severity) {
      const fromPct = ((s.from - min) / range) * 100;
      const toPct = ((s.to - min) / range) * 100;
      stops.push(`${s.color} ${fromPct.toFixed(1)}%`);
      stops.push(`${s.color} ${toPct.toFixed(1)}%`);
    }

    return `linear-gradient(to right, ${stops.join(', ')})`;
  }

  private _getMatchingSeverity(value: number): { color: string; from: number; to: number } | undefined {
    const severity = this._config.severity;
    if (!severity || !Array.isArray(severity)) return undefined;
    return severity.find((s: any) => value >= s.from && value <= s.to);
  }
}

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'severity-bar-card',
  name: 'Severity Bar Card',
  description: 'A card with icon, value, and gradient severity progress bar',
});
