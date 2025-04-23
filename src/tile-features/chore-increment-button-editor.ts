import { LovelaceCardConfig } from '@home-assistant/frontend/src/data/lovelace/config/card';
import { css, html, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseEditor } from '../base-editor';
import { Selector } from '@home-assistant/frontend/src/data/selector';

@customElement('chore-increment-button-editor')
class ChoreIncrementButtonEditor extends BaseEditor<ChoreIncrementButtonConfig> {
  renderBody(): TemplateResult {
    return html`
      <div class="row">
        <ha-selector
          label="Name"
          helper="Name to display on the button"
          .hass=${this.hass}
          .selector=${{ text: { type: 'text' } } as Selector}
          .value=${this.config.name}
          name="name"
          @value-changed=${this._valueChanged}
        ></ha-selector>

        <ha-selector
          label="Icon"
          .hass=${this.hass}
          .selector=${{ icon: { fallbackPath: 'mdi:lightning-bolt' } }}
          .value=${this.config.icon}
          name="icon"
          @value-changed=${this._valueChanged}
        ></ha-selector>
      </div>

      <ha-selector
        label="Increment"
        helper="Use negative number to 'decrement'"
        .hass=${this.hass}
        .selector=${{ number: { step: 1, mode: 'box' } } as Selector}
        .value=${this.config.increment}
        name="increment"
        @value-changed=${this._valueChanged}
      ></ha-selector>
    `;
  }
}

export interface ChoreIncrementButtonConfig extends LovelaceCardConfig {
  increment?: string;
  name?: string;
  icon?: string;
}
