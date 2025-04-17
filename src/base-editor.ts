import { LovelaceCardConfig } from '@home-assistant/frontend/src/data/lovelace/config/card';
import { BaseCard } from './base-card';

export abstract class BaseEditor<T extends LovelaceCardConfig> extends BaseCard<T> {
  protected _valueChanged(ev: CustomEvent) {
    if (!this.config || !this.hass) return;

    const target = ev.target as any;
    const value = ev.detail?.value !== undefined ? ev.detail?.value : target.value;
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
