import { HomeAssistant } from "@home-assistant/frontend/src/types";
import { html, LitElement, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("chore-card-editor")
class ContentCardEditor extends LitElement {
  static styles = css`
    ha-textfield,
    ha-entity-picker {
      display: block;
      margin-bottom: 16px;
    }
  `;

  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: any;

  setConfig(config) {
    this._config = config;
  }

  render() {
    if (!this.hass || !this._config) return html``;

    return html`
      <ha-selector
        .hass=${this.hass}
        .selector=${{
          entity: {
            domain: ["sensor"],
            integration: "chore",
          },
        }}
        value=${this._config.entity || ""}
        name="entity"
        @value-changed=${this._valueChanged}
      ></ha-selector>
    `;
  }

  private _valueChanged(ev: Event) {
    if (!this._config || !this.hass) return;

    const target = ev.target as any;
    const value = (ev as any).detail?.value || target.value;
    const field = target.name;

    if (this._config[field] === value) return;

    this._config = {
      ...this._config,
      [field]: value,
    };

    this._bubleChanges(this._config);
  }

  private _bubleChanges(newConfig) {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: newConfig },
        bubbles: true,
        composed: true,
      })
    );
  }
}
