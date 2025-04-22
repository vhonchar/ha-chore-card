import { css, html, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseCard } from '../base-card';
import '../components/chore-progress';
import { ScheduledChoreEntity } from '../type';
import { ChoreCardConfig } from './editor';
import { HomeAssistant } from '@home-assistant/frontend/src/types';
import './editor';

@customElement('chore-card')
export class ChoreCard extends BaseCard<ChoreCardConfig> {
  static styles = css`
    :host {
      --icon-color: var(--state-icon-color);
      --button-border-color: #0097fb;
      --button-text-color: #0097fb;
    }

    ha-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border-radius: var(--ha-card-border-radius, 12px);
      box-sizing: border-box;
      color: var(--primary-text-color);
      background: var(--card-background-color, white);
      padding: 10px;
    }

    ha-card.slim {
      padding: 7px;
    }

    .card-root {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .header {
      flex: 1;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .icon {
      color: var(--icon-color);
      margin-right: 16px;
      --mdc-icon-size: 24px;
    }

    .info {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }

    .title {
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.1px;
      color: var(--primary-text-color);
    }

    .state {
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.4px;
      color: var(--primary-text-color);
    }

    .buttons-container {
      display: flex;
      gap: 8px;
    }

    .button {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 36px;
      border-radius: var(--ha-card-border-radius, 12px);
      border: 1px solid var(--button-border-color);
      color: var(--button-text-color);
      background: transparent;
      font-weight: 500;
      cursor: pointer;
      font-size: 0.9rem;
      padding: 0 12px;
      gap: 4px;
      transition: background-color 0.2s ease;
    }

    .button:hover {
      background-color: rgba(0, 151, 251, 0.1);
    }

    .button:active {
      background-color: rgba(0, 151, 251, 0.2);
    }

    .button ha-icon {
      --mdc-icon-size: 18px;
    }

    .progress-container {
      margin-top: 10px;
      height: 4px;
    }

    .progress-container.large {
      height: 13px;
    }

    .slim .progress-container {
      margin: 8px 4px;
    }
  `;

  static getStubConfig(hass: HomeAssistant) {
    const entity = Object.values(hass.entities).find((it) => it.entity_id.startsWith('sensor.') && it.platform === 'chore')?.entity_id;

    return entity
      ? {
          entity: entity,
        }
      : undefined;
  }

  static getConfigElement() {
    return document.createElement('chore-card-editor');
  }

  renderBody(): TemplateResult {
    const entity = this.hass.states[this.config.entity || ''] as ScheduledChoreEntity | undefined;

    if (!entity) {
      return html`
        <ha-card>
          <div class="header">Entity ${this.config.entity} not found</div>
        </ha-card>
      `;
    }

    const icon = this.config.icon || entity.attributes.icon || 'mdi:broom';
    const name = this.config.name || entity.attributes.friendly_name || entity.entity_id;
    const attributesToDisplay = Array.isArray(this.config.attributesToDisplay) ? this.config.attributesToDisplay : [this.config.attributesToDisplay || 'state'];
    const state =
      attributesToDisplay
        .map((it) => {
          if (it === 'state') return entity.state;
          if (it === 'name') return entity.attributes.friendly_name;
          return entity.attributes[it];
        })
        .filter((it) => it)
        .join(' ⸱ ') || '';

    const slim = parseInt(getComputedStyle(this).getPropertyValue('--row-size')) === 1;

    return html`
      <ha-card class="${slim ? 'slim' : ''}">
        <div class="card-root">
          <div class="header">
            <ha-icon
              class="icon"
              icon="${icon}"
            ></ha-icon>

            <div class="info">
              <div class="title">${name}</div>
              <div class="state">${state}</div>
            </div>

            <div class="buttons-container">
              ${this.config.show_add_button
                ? html`
                    <button
                      class="button"
                      @click=${this._handleIncrement}
                    >
                      <ha-icon icon="${this.config.add_icon}"></ha-icon>
                      ${this.config.add_button_text}
                    </button>
                  `
                : ''}
              ${this.config.show_remove_button
                ? html`
                    <button
                      class="button"
                      @click=${this._handleDecrement}
                    >
                      <ha-icon icon="${this.config.remove_icon}"></ha-icon>
                      ${this.config.remove_button_text}
                    </button>
                  `
                : ''}
            </div>
          </div>

          <div class="progress-container ${this.config.largerProgressBar ? 'large' : ''}">
            <chore-progress .chore=${entity}></chore-progress>
          </div>
        </div>
      </ha-card>
    `;
  }

  _handleIncrement() {
    const amount = this.config.increment_amount || 1;
    this._callService('increment', amount);
  }

  _handleDecrement() {
    const amount = this.config.decrement_amount || 1;
    this._callService('decrement', amount);
  }

  _callService(action: string, amount: number) {
    if (!this.hass || !this.config.entity) return;

    const entityType = this.config.entity.split('.')[0];

    if (entityType === 'counter') {
      this.hass.callService('counter', action, {
        entity_id: this.config.entity,
      });
    } else if (entityType === 'input_number') {
      const currentValue = parseFloat(this.hass.states[this.config.entity].state);
      const newValue = action === 'increment' ? currentValue + amount : currentValue - amount;

      this.hass.callService('input_number', 'set_value', {
        entity_id: this.config.entity,
        value: newValue,
      });
    } else if (entityType === 'number') {
      const currentValue = parseFloat(this.hass.states[this.config.entity].state);
      const newValue = action === 'increment' ? currentValue + amount : currentValue - amount;

      this.hass.callService('number', 'set_value', {
        entity_id: this.config.entity,
        value: newValue,
      });
    } else if (entityType === 'sensor') {
      this.hass.callService('chore', action, {
        entity_id: this.config.entity,
        [action === 'increment' ? 'increment' : 'decrement']: amount,
      });
    }
  }
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'chore-card',
  name: 'Chore Card',
  description: 'A card for tracking chores',
  configurable: true,
  preview: true,
});
