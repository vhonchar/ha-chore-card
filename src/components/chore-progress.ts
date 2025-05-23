import { css, html, LitElement, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { CounterChoreEntity, isScheduledChore, ScheduledChoreEntity } from '../type';
import { HomeAssistant } from '@home-assistant/frontend/src/types';
import { toDate, toZonedTime } from 'date-fns-tz';

/**
 * A reusable progress bar component for chore tracking.
 *
 * @element chore-progress
 * @csspart bar-container - Container element for the progress bar
 * @csspart bar-fill - The filled portion of the progress bar
 * @cssproperty --primary-background-color - Background color of the progress bar (defaults to #222)
 * @cssproperty --success-color - Color for "good" status (defaults to #4caf50)
 * @cssproperty --warning-color - Color for "warning" status (defaults to #f9a825)
 * @cssproperty --error-color - Color for "overdue" status (defaults to #f44336)
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

  /**
   * The chore entity to display progress for.
   * Must be either a ScheduledChoreEntity or CounterChoreEntity.
   *
   * @type {ScheduledChoreEntity | CounterChoreEntity}
   */
  @property({ attribute: false }) chore!: ScheduledChoreEntity | CounterChoreEntity;

  /**
   * Whether to animate progress bar changes.
   *
   * @type {boolean}
   * @default true
   */
  @property({ type: Boolean }) animated = true;

  /**
   * Minimum fill percentage (ensures very small progress is still visible).
   *
   * @type {number}
   * @default 2
   */
  @property({ type: Number }) minFillment = 2;

  /**
   * Percentage threshold at which the progress bar changes to warning state.
   *
   * @type {number} - from 1 to 100
   * @default 75
   */
  @property({ type: Number }) warningThreashhold = 75;

  /**
   * Home Assistant object — required
   *
   * @type {HomeAssistant}
   */
  @property({ attribute: false }) hass!: HomeAssistant;

  protected updated(changedProperties: PropertyValues): void {
    if (!this.hass && !changedProperties.get('hass')) {
      throw new Error('hass is required');
    }
  }

  render() {
    const progress = isScheduledChore(this.chore) ? this.calculateSheduledChoreProgress(this.chore) : calculateCounterChoreProgress(this.chore);
    const widthPercentage = Math.max(this.minFillment, progress);
    const statusClass = progress >= 100 ? 'overdue' : progress > this.warningThreashhold ? 'warning' : 'good';

    // Transition styles for animation control
    const fillStyles = {
      width: `${widthPercentage}%`,
      transition: this.animated ? 'width 0.3s ease' : 'none',
    };

    return html`
      <div
        class="bar-container"
        part="bar-container"
      >
        <div
          class="bar-fill ${statusClass}"
          style=${styleMap(fillStyles)}
          part="bar-fill"
        ></div>
      </div>
    `;
  }

  private calculateSheduledChoreProgress(scheduledChore: ScheduledChoreEntity) {
    const haTimeZone = this.hass.config.time_zone;

    const today = toZonedTime(new Date(), haTimeZone);
    const lastCompletion = toDate(scheduledChore.attributes.last_completion_date, { timeZone: haTimeZone });
    const due = toDate(scheduledChore.attributes.next_due_date, { timeZone: haTimeZone });

    if (due <= lastCompletion) return 1;

    const total = due.getTime() - lastCompletion.getTime();
    const elapsed = today.getTime() - lastCompletion.getTime();

    const rawProgress = elapsed / total;
    return Math.min(1, Math.max(0, rawProgress)) * 100;
  }
}

/**
 * Calculate the progress percentage for a counter-based chore.
 *
 * @param {CounterChoreEntity} entity - The counter chore entity
 * @returns {number} Progress persentage
 */
const calculateCounterChoreProgress = (entity: CounterChoreEntity) => {
  return Math.min(1, entity.attributes.counter_state / entity.attributes.limit) * 100;
};

declare global {
  interface HTMLElementTagNameMap {
    'chore-progress': ChoreProgress;
  }
}
