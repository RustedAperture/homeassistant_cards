import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("severity-bar-card")
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
      entity: "sensor.example",
      name: "Example",
      icon: "mdi:chart-line",
      min: 0,
      max: 100,
      severity: [
        { color: "#2ecc71", from: 0, to: 50 },
        { color: "#e74c3c", from: 51, to: 100 },
      ],
    };
  }

  static getConfigForm() {
    return {
      schema: [
        { name: "entity", required: true, selector: { entity: {} } },
        {
          type: "grid",
          name: "",
          schema: [
            { name: "name", selector: { text: {} } },
            {
              name: "icon",
              selector: { icon: {} },
              context: { icon_entity: "entity" },
            },
            { name: "min", selector: { number: { mode: "box" } } },
            { name: "max", selector: { number: { mode: "box" } } },
          ],
        },
      ],
    };
  }

  setConfig(config: any) {
    if (!config.entity) {
      throw new Error("You need to define an entity");
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

    const name =
      this._config.name ||
      stateObj?.attributes?.friendly_name ||
      this._config.entity;
    const icon = this._config.icon || "mdi:chart-line";
    const severityColor = this._getSeverityColor(state);
    const severityBg = this._getSeverityBgColor(state);

    return html`
      <ha-card class="card">
        <div class="content">
          <div
            class="icon"
            style="background-color: ${severityBg}; color: ${severityColor};"
          >
            <ha-icon .icon="${icon}"></ha-icon>
          </div>
          <div class="right">
            <div class="name">${name}</div>
            <div class="value-row">
              <span class="value" style="color: ${severityColor};">
                ${isUnavailable ? "N/A" : state.toFixed(1)}
              </span>
              <div class="bar-container">
                <div
                  class="bar-background"
                  style="background: ${this._getGradient()};"
                ></div>
                <div
                  class="bar-fill"
                  style="
                    width: ${isUnavailable
                    ? "0%"
                    : this._getFillPercent(state)}%;
                    background-color: ${severityColor};
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
      height: 100%;
    }
    ha-card {
      display: flex;
      align-items: center;
      padding: 0 12px;
      height: 100%;
      box-sizing: border-box;
      cursor: pointer;
      transition: background-color 0.15s ease;
    }
    ha-card:hover {
      background-color: rgba(var(--rgb-primary-text-color), 0.04);
    }
    .content {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      width: 100%;
    }
    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .icon ha-icon {
      --mdc-icon-size: 18px;
    }
    .right {
      flex: 1;
      min-width: 0;
    }
    .name {
      font-family: Roboto, sans-serif;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.1px;
      line-height: 18px;
      margin-bottom: 4px;
    }
    .value-row {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .value {
      font-family: Roboto, Noto, sans-serif;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.4px;
      line-height: 14px;
      flex-shrink: 0;
      min-width: 28px;
    }
    .bar-container {
      flex: 1;
      position: relative;
      height: 12px;
      border-radius: 6px;
      overflow: hidden;
    }
    .bar-background {
      position: absolute;
      inset: 0;
      border-radius: 6px;
      opacity: 0.6;
    }
    .bar-fill {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      border-radius: 6px;
      transition: width 0.3s ease;
    }
  `;

  private _getSeverityColor(value: number): string {
    const severity = this._getMatchingSeverity(value);
    return severity ? severity.color : "rgb(200, 200, 200)";
  }

  private _getSeverityBgColor(value: number): string {
    const hex = this._getSeverityColor(value);
    if (hex.startsWith("#")) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.2)`;
    }
    return hex.replace("rgb", "rgba").replace(")", ", 0.2)");
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
      return "rgba(128, 128, 128, 0.3)";
    }

    const min = this._config.min ?? 0;
    const max = this._config.max ?? 100;
    const range = max - min;
    const blendZone = 0.02; // 2% blend at boundaries

    const stops: string[] = [];

    for (let i = 0; i < severity.length; i++) {
      const s = severity[i];
      const fromPct = ((s.from - min) / range) * 100;
      const toPct = ((s.to - min) / range) * 100;
      const blend = (toPct - fromPct) * blendZone;

      // Start of this range (solid)
      stops.push(`${s.color} ${fromPct.toFixed(1)}%`);
      // End of this range, just before blend starts
      if (i < severity.length - 1) {
        stops.push(`${s.color} ${(toPct - blend).toFixed(1)}%`);
        // Start of next range blend
        const nextColor = severity[i + 1].color;
        stops.push(`${nextColor} ${(toPct + blend).toFixed(1)}%`);
      } else {
        // Last range extends to the end
        stops.push(`${s.color} ${toPct.toFixed(1)}%`);
      }
    }

    return `linear-gradient(to right, ${stops.join(", ")})`;
  }

  private _getMatchingSeverity(
    value: number,
  ): { color: string; from: number; to: number } | undefined {
    const severity = this._config.severity;
    if (!severity || !Array.isArray(severity)) return undefined;
    return severity.find((s: any) => value >= s.from && value <= s.to);
  }
}

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "severity-bar-card",
  name: "Severity Bar Card",
  description: "A card with icon, value, and gradient severity progress bar",
});
