import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { CounterChoreEntity, isScheduledChore, ScheduledChoreEntity } from '../type';

/**
 * A reusable progress bar component.
 *
 * @element chore-progress
 */
@customElement('chore-progress')
export class ChoreProgress extends LitElement {
  static styles = css`
    .bar-container {
      width: 100%;
      height: 100%;
      min-height: 4px;
      background-color: var(--primary-background-color, #222);
      border-radius: 1000px;
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

  @property({ attribute: false }) chore!: ScheduledChoreEntity | CounterChoreEntity;
  @property({ type: Boolean }) animated = true;
  @property({ type: Number }) minFillment = 2;

  render() {
    const progress = isScheduledChore(this.chore) ? calculateSheduledChoreProgress(this.chore) : calculateCounterChoreProgress(this.chore);
    const widthPercentage = Math.max(this.minFillment, progress * 100);
    const statusClass = progress >= 1 ? 'overdue' : progress > 0.8 ? 'warning' : 'good';

    // Transition styles for animation control
    const fillStyles = {
      width: `${widthPercentage}%`,
      transition: this.animated ? 'width 0.3s ease' : 'none',
    };

    return html`
      <div class="bar-container">
        <div
          class="bar-fill ${statusClass}"
          style=${styleMap(fillStyles)}
        ></div>
      </div>
    `;
  }
}

const calculateSheduledChoreProgress = (scheduledChore: ScheduledChoreEntity) => {
  const today = new Date();
  const start = new Date(scheduledChore.attributes.last_completion_date);
  const due = new Date(scheduledChore.attributes.next_due_date);

  if (due <= start) return 1;

  const total = due.getTime() - start.getTime();
  const elapsed = today.getTime() - start.getTime();

  const rawProgress = elapsed / total;
  return Math.min(1, Math.max(0, rawProgress));
};

const calculateCounterChoreProgress = (entity: CounterChoreEntity) => {
  return Math.min(1, entity.attributes.counter_state / entity.attributes.limit);
};

declare global {
  interface HTMLElementTagNameMap {
    'progress-bar': ChoreProgress;
  }
}
