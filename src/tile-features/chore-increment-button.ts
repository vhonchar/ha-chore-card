import { css, html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { HassEntity } from 'home-assistant-js-websocket';
import { BaseCard } from '../base-card';
import { ChoreIncrementButtonConfig } from './chore-increment-button-editor';
import './chore-increment-button-editor';

const supportsChoreIncrementButton = (stateObj) => {
  return stateObj.attributes.chore_integration === true && stateObj.attributes.counter_state;
};

@customElement('chore-increment-button')
class ChoreIncrementButton extends BaseCard<ChoreIncrementButtonConfig> {
  static styles = css`
    button {
      all: unset;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      height: var(--feature-height);
      width: 100%;
      box-sizing: border-box;
      border-radius: var(--ha-card-border-radius, 6px);
      border: 1px solid var(--primary-color);
      color: var(--primary-color);
      font-weight: 500;
      background-color: transparent;
      cursor: pointer;
      padding: 0.3em 0.6em;
      gap: 0.4em;
      transition:
        background-color 0.2s,
        border-color 0.2s,
        color 0.2s;
    }

    button:hover {
      background-color: var(--primary-color-opacity, rgba(0, 123, 255, 0.1));
    }

    button:active {
      background-color: var(--primary-color-opacity-pressed, rgba(0, 123, 255, 0.2));
    }

    button:disabled {
      border-color: var(--disabled-color);
      color: var(--disabled-color);
      cursor: not-allowed;
      opacity: 0.6;
    }

    ha-icon {
      color: var(--primary-color);
    }

    .label {
      text-align: center;
      white-space: nowrap;
      /* line-height: 1; */
    }
  `;

  static getConfigElement() {
    return document.createElement('chore-increment-button-editor');
  }

  @property({ attribute: false }) stateObj!: HassEntity;

  willUpdate(changedProps: Map<string, unknown>) {
    super.willUpdate(changedProps);
    if (!this.stateObj && !changedProps.get('stateObj')) {
      throw new Error('Missing required property: stateObj');
    }
  }

  renderBody(): TemplateResult {
    if (!supportsChoreIncrementButton(this.stateObj)) {
      return html``;
    }

    return html`
      <button @click=${this._onClick}>
        <ha-icon icon="${this.config.icon || 'mdi:lightning-bolt'}"></ha-icon>
        <div class="label">${this.config.name || 'Increment'}</div>
      </button>
    `;
  }

  _onClick(ev: Event) {
    ev.stopPropagation();
    this.hass.callService('chore', 'increment', { increment: this.config.increment || 1 }, { entity_id: this.stateObj.entity_id });
  }
}

window.customCardFeatures = window.customCardFeatures || [];
window.customCardFeatures.push({
  type: 'chore-increment-button',
  name: 'Increment',
  supported: supportsChoreIncrementButton,
  configurable: true,
});
