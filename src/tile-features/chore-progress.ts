import { HomeAssistant } from '@home-assistant/frontend/src/types';
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import '@material/web/progress/linear-progress.js';
import './chore-progress-editor';
import { ChoreProgressConfig } from './chore-progress-editor';

const supportsChoreProgressBar = (stateObj, ...anythingElse) => {
  console.log(anythingElse);
  return stateObj.attributes.chore_integration === true;
};

@customElement('chore-progress')
class ChoreProgress extends LitElement {
  static styles = css`
    md-linear-progress {
      width: 100%;
      --md-linear-progress-track-color: var(--primary-background-color, #fff);
      --md-linear-progress-track-height: calc(var(--feature-height, 36px) * var(--height-multiplier));
      --md-linear-progress-track-shape: calc(var(--feature-height, 36px) * var(--height-multiplier));
      --md-linear-progress-active-indicator-height: calc(var(--feature-height, 36px) * var(--height-multiplier));
    }

    md-linear-progress.good {
      --md-linear-progress-active-indicator-color: var(--success-color);
    }

    md-linear-progress.warning {
      --md-linear-progress-active-indicator-color: var(--warning-color);
    }

    md-linear-progress.overdue {
      --md-linear-progress-active-indicator-color: var(--error-color);
    }
  `;

  static getConfigElement() {
    return document.createElement('chore-progress-editor');
  }

  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) stateObj!: any;
  @state() private config!: ChoreProgressConfig;

  willUpdate(changedProps: Map<string, unknown>) {
    if (!this.hass && !changedProps.get('hass')) {
      throw new Error('Missing required property: hass');
    }
    if (!this.stateObj && !changedProps.get('stateObj')) {
      throw new Error('Missing required property: stateObj');
    }
  }

  setConfig(config: ChoreProgressConfig) {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    this.config = config;
  }

  _press(ev: Event) {
    ev.stopPropagation();
    this.hass.callService('button', 'press', {
      entity_id: this.stateObj.entity_id,
    });
  }

  render() {
    if (!supportsChoreProgressBar(this.stateObj)) {
      return null;
    }
    const progress = Math.min(1, this.stateObj.attributes.counter_state / this.stateObj.attributes.limit);
    const statusClass = progress >= 1 ? 'overdue' : progress > 0.8 ? 'warning' : 'good';
    const heightMultiplier = this.config.enableLarge ? 1 : 0.3;

    return html`
      <md-linear-progress
        style="--height-multiplier: ${heightMultiplier}"
        class="${statusClass}"
        .value="${progress}"
        .indeterminate="${false}"
      >
      </md-linear-progress>
    `;
  }
}

window.customCardFeatures = window.customCardFeatures || [];
window.customCardFeatures.push({
  type: 'chore-progress',
  name: 'Progress bar',
  supported: supportsChoreProgressBar,
  configurable: true,
});
