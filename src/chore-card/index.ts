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
    ha-card {
      height: 100%;
      border-radius: var(--ha-card-border-radius, 12px);
      box-sizing: border-box;
      color: var(--primary-text-color);
      background: var(--ha-card-background, var(--card-background-color, #fff));
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
      color: var(--state-icon-color);
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
          @click=${() => this.fireEvent('hass-more-info', { entityId: entity.entity_id })}
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
              .hass=${this.hass}
              .chore=${entity}
              minFillment="2"
              warningThreashhold=${this.config.warningThreshold || 75}
            ></chore-progress>
          </div>
        </div>
      </ha-card>
    `;
  }

  private fireEvent(type: string, detail: Record<string, any>) {
    const event = new Event(type);
    (event as any).detail = detail;
    this.dispatchEvent(event);
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
