import { html, css, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseEditor } from '../base-editor';
import { LovelaceCardConfig } from '@home-assistant/frontend/src/data/lovelace/config/card';
import { Selector } from '@home-assistant/frontend/src/data/selector';

export interface ChoreCardConfig extends LovelaceCardConfig {
  entity?: string;
  name?: string;
  icon?: string;
  attributesToDisplay?: string | string[];
  largerProgressBar?: boolean;
}

@customElement('chore-card-editor')
export class ChoreCardEditor extends BaseEditor<ChoreCardConfig> {
  static styles = css`
    .row {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }

    .row ha-selector {
      flex: 1;
      margin-bottom: 0;
    }

    ha-selector:not([helper]):not(:last-child):not(.row ha-selector) {
      display: block;
      margin-bottom: 24px;
    }

    ha-selector[helper]:not(:last-child):not(.row ha-selector) {
      display: block;
      margin-bottom: 8px;
    }
  `;

  renderBody(): TemplateResult {
    return html`
      <ha-selector
        label="Entity"
        .required=${true}
        .hass=${this.hass}
        .selector=${{
          entity: {
            domain: ['sensor'],
            integration: 'chore',
          },
        }}
        value=${this.config.entity || ''}
        name="entity"
        @value-changed=${this._valueChanged}
      ></ha-selector>

      <div class="row">
        <ha-selector
          label="Name"
          .required=${false}
          helper="Name of the entity"
          .hass=${this.hass}
          .selector=${{ text: { type: 'text' } } as Selector}
          .value=${this.config.name}
          name="name"
          @value-changed=${this._valueChanged}
        ></ha-selector>

        <ha-selector
          label="Icon"
          .required=${false}
          .hass=${this.hass}
          .selector=${{ icon: { fallbackPath: 'mdi:lightning-bolt' } }}
          .value=${this.config.icon}
          name="icon"
          @value-changed=${this._valueChanged}
        ></ha-selector>
      </div>
      <ha-selector
        label="State content"
        .required=${false}
        .hass=${this.hass}
        .selector=${{
          ui_state_content: {
            entity_id: this.config.entity,
            allow_name: true,
          },
        }}
        .value=${this.config.attributesToDisplay}
        name="attributesToDisplay"
        @value-changed=${this._valueChanged}
      ></ha-selector>
      <ha-selector
        label="Larger progress bar"
        .hass="${this.hass}"
        .selector="${{
          boolean: {},
        }}"
        .value="${this.config.largerProgressBar}"
        .name="${'largerProgressBar'}"
        @value-changed="${this._valueChanged}"
      ></ha-selector>
    `;
  }
}
