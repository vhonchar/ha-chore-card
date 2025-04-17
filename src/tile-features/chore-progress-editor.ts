import { LovelaceCardConfig } from '@home-assistant/frontend/src/data/lovelace/config/card';
import { HomeAssistant } from '@home-assistant/frontend/src/types';
import { html, LitElement, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('chore-progress-editor')
class ChoreProgressEditor extends LitElement {
  static styles = css``;

  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: ChoreProgressConfig;

  setConfig(config: ChoreProgressConfig) {
    this._config = config;
  }

  render() {
    if (!this.hass || !this._config) return html``;

    return html`
      <ha-selector
        label="Enable large bar?"
        .hass="${this.hass}"
        .selector="${{
          boolean: {},
        }}"
        .value="${this._config.enableLarge}"
        .name="${'enableLarge'}"
        @value-changed="${this._valueChanged}"
      ></ha-selector>
    `;
  }

  private _valueChanged(ev: CustomEvent) {
    if (!this._config || !this.hass) return;

    const target = ev.target as any;
    const value = ev.detail?.value !== undefined ? ev.detail?.value : target.value;
    const field = target.name;

    if (this._config[field] === value) return;

    this._config = {
      ...this._config,
      [field]: value,
    };
    this._bubleChanges();
  }

  private _bubleChanges() {
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

export interface ChoreProgressConfig extends LovelaceCardConfig {
  enableLarge?: string;
}
