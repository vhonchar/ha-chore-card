import { css, html, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseCard } from '../base-card';
import '../components/chore-progress';
import { ScheduledChoreEntity } from '../type';
import { ChoreCardConfig } from './editor';
import { HomeAssistant } from '@home-assistant/frontend/src/types';
import './editor';
import { fireEvent, ValidHassDomEvent } from '@home-assistant/frontend/src/common/dom/fire_event';

@customElement('chore-card')
export class ChoreCard extends BaseCard<ChoreCardConfig> {
  static styles = css`
    :host {
      --icon-color: var(--state-icon-color);
    }

    ha-card {
      height: 100%;
      border-radius: var(--ha-card-border-radius, 12px);
      box-sizing: border-box;
      color: var(--primary-text-color);
      background: var(--card-background-color, white);
    }

    .card-root {
      display: flex;
      flex-direction: column;
      height: 100%;
      cursor: pointer;
    }

    .header {
      flex: 1;
      width: 100%;
      padding: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
      justify-content: space-between;
    }

    .slim .header {
      padding: 5px 10px;
    }

    .icon {
      color: var(--icon-color);
      --mdc-icon-size: 24px;
      padding: 6px;
    }

    .info {
      display: flex;
      flex-direction: column;
      flex: 1;
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

    .progress-container {
      padding: 0px 12px 12px 12px;
      height: 4px;
    }

    .progress-container.large {
      height: 13px;
    }

    .slim .progress-container {
      padding: 0px 12px;
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
        <div
          class="card-root"
          @click=${() => fireEvent(this, 'hass-more-info' as ValidHassDomEvent, { entityId: entity.entity_id })}
          role="button"
        >
          <ha-ripple></ha-ripple>
          <div class="header">
            <ha-icon
              class="icon"
              icon="${icon}"
            ></ha-icon>

            <div class="info">
              <div class="title">${name}</div>
              <div class="state">${state}</div>
            </div>
          </div>

          <div class="progress-container ${this.config.largerProgressBar ? 'large' : ''}">
            <chore-progress
              .chore=${entity}
              minFillment="2"
            ></chore-progress>
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
