# Severity Bar Card

A custom Home Assistant Lovelace card with an icon, entity name, value, and gradient severity progress bar.

## Installation

1. Build the card:
   ```bash
   npm install
   npm run build
   ```

2. Copy `dist/severity-bar-card.js` to your Home Assistant `www/` folder:
   ```bash
   cp dist/severity-bar-card.js /path/to/ha/config/www/severity-bar-card.js
   ```

3. Add the resource in Home Assistant:
   - Go to **Settings → Dashboards → Resources**
   - Add `/local/severity-bar-card.js` as type **Module**
   - Restart Home Assistant

## Usage

```yaml
type: custom:severity-bar-card
entity: sensor.terrace_bay_uv_index
name: UV Index
icon: mdi:weather-sunny
min: 0
max: 11
severity:
  - color: "#2ecc71"
    from: 0
    to: 2
  - color: "#f1c40f"
    from: 3
    to: 5
  - color: "#e67e22"
    from: 6
    to: 7
  - color: "#e74c3c"
    from: 8
    to: 11
```

## Configuration

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `entity` | string | Yes | — | Entity ID to display |
| `name` | string | No | Entity friendly name | Label shown above value |
| `icon` | string | No | `mdi:chart-line` | MDI icon name |
| `min` | number | No | `0` | Minimum value for the bar |
| `max` | number | No | `100` | Maximum value for the bar |
| `severity` | array | No | Single gray level | Array of `{color, from, to}` objects |
