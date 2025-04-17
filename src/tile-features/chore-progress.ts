import { HomeAssistant } from '@home-assistant/frontend/src/types';
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './chore-progress-editor';
import { ChoreProgressConfig } from './chore-progress-editor';

@customElement('chore-progress')
class ChoreProgress extends LitElement {
  static styles = css`
    .bar-container {
      width: 100%;
      height: calc(var(--feature-height, 36px) * var(--height-multiplier));
      background-color: var(--primary-background-color, #222);
      border-radius: calc(var(--feature-height, 36px) * var(--height-multiplier));
      overflow: hidden;
      display: flex;
    }

    .bar-fill {
      height: 100%;
      border-radius: inherit;
      transition: width 0.3s ease;
    }

    .bar-fill.good {
      background-color: var(--success-color, #4caf50);
    }

    .bar-fill.warning {
      background-color: var(--warning-color, #f9a825);
    }

    .bar-fill.overdue {
      background-color: var(--error-color, #f44336);
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

    const progress = isScheduledChore(this.stateObj) ? calculateSheduledChoreProgress(this.stateObj) : calculateCounterChoreProgress(this.stateObj);
    const statusClass = progress >= 1 ? 'overdue' : progress > 0.8 ? 'warning' : 'good';
    const heightMultiplier = this.config.enableLarge ? 1 : 0.3;

    return html`
      <div
        class="bar-container"
        style="--height-multiplier: ${heightMultiplier};"
      >
        <div
          class="bar-fill ${statusClass}"
          style="width: ${progress * 100}%"
        ></div>
      </div>
    `;
  }
}

const supportsChoreProgressBar = (stateObj) => {
  return stateObj.attributes.chore_integration === true;
};

interface ScheduledChoreEntity {
  attributes: {
    next_due_date: string;
    start_from: string;
  };
}
const isScheduledChore = (obj: any): obj is ScheduledChoreEntity => {
  return obj.attributes.next_due_date;
};

const calculateSheduledChoreProgress = (scheduledChore: ScheduledChoreEntity) => {
  const today = new Date();
  const start = new Date(scheduledChore.attributes.start_from);
  const due = new Date(scheduledChore.attributes.next_due_date);

  if (due <= start) return 1;

  const total = due.getTime() - start.getTime();
  const elapsed = today.getTime() - start.getTime();

  const rawProgress = elapsed / total;
  return Math.min(1, Math.max(0, rawProgress));
};

const calculateCounterChoreProgress = (entity: any) => {
  return Math.min(1, entity.attributes.counter_state / entity.attributes.limit);
};

window.customCardFeatures = window.customCardFeatures || [];
window.customCardFeatures.push({
  type: 'chore-progress',
  name: 'Progress bar',
  supported: supportsChoreProgressBar,
  configurable: true,
});
