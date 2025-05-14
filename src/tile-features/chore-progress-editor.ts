import { LovelaceCardConfig } from '@home-assistant/frontend/src/data/lovelace/config/card';
import { HomeAssistant } from '@home-assistant/frontend/src/types';
import { html, LitElement, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { BaseEditor } from '../base-editor';
import { NumberSelector } from '@home-assistant/frontend/src/data/selector';

@customElement('chore-progress-editor')
class ChoreProgressEditor extends BaseEditor<ChoreProgressConfig> {
  renderBody(): TemplateResult {
    return html`
      <ha-selector
        label="Enable large bar?"
        .hass="${this.hass}"
        .selector="${{
          boolean: {},
        }}"
        .value="${this.config.enableLarge}"
        .name="${'enableLarge'}"
        @value-changed="${this._valueChanged}"
      ></ha-selector>
      <ha-selector
        label="Warning threshold"
        .hass="${this.hass}"
        .selector="${{
          number: {
            min: 1,
            max: 99,
            step: 1,
            mode: 'slider',
            unit_of_measurement: '%',
            slider_ticks: true,
          },
        } as NumberSelector}"
        .value="${this.config.warningThreshold ?? 75}"
        .name="${'warningThreshold'}"
        @value-changed="${this._valueChanged}"
      ></ha-selector>
    `;
  }
}

export interface ChoreProgressConfig extends LovelaceCardConfig {
  enableLarge?: string;
  warningThreshold?: number;
}
