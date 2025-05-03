import { HomeAssistant } from '@home-assistant/frontend/src/types';
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './chore-progress-editor';
import { ChoreProgressConfig } from './chore-progress-editor';
import '../components/chore-progress';

@customElement('tile-feature-chore-progress')
class TileFeatureChoreProgress extends LitElement {
  static styles = css`
    chore-progress {
      display: block;
      height: calc(var(--feature-height, 36px) * var(--height-multiplier, 0.3));
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

  render() {
    if (!supportsChoreProgressBar(this.stateObj)) {
      return null;
    }

    const heightMultiplier = this.config.enableLarge ? 1 : 0.3;

    return html`
      <chore-progress
        style="--height-multiplier: ${heightMultiplier}"
        .hass=${this.hass}
        .chore=${this.stateObj}
        .warningThreashhold=${this.config.warningThreshold ?? 75}
      ></chore-progress>
    `;
  }
}

const supportsChoreProgressBar = (stateObj) => {
  return stateObj.attributes.chore_integration === true;
};

window.customCardFeatures = window.customCardFeatures || [];
window.customCardFeatures.push({
  type: 'tile-feature-chore-progress',
  name: 'Progress bar',
  supported: supportsChoreProgressBar,
  configurable: true,
});
