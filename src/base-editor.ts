import { LovelaceCardConfig } from '@home-assistant/frontend/src/data/lovelace/config/card';
import { BaseCard } from './base-card';
import { css } from 'lit';

export abstract class BaseEditor<T extends LovelaceCardConfig> extends BaseCard<T> {
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

  protected _valueChanged(ev: CustomEvent) {
    if (!this.config || !this.hass) return;

    const target = ev.target as any;
    const value = ev.detail?.value;
    const field = target.name;

    if (this.config[field] === value) return;

    this.config = {
      ...this.config,
      [field]: value,
    };
    this._bubleChanges();
  }

  private _bubleChanges() {
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: this.config },
        bubbles: true,
        composed: true,
      }),
    );
  }
}
