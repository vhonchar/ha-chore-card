import { css, html, LitElement } from "lit";
import "./editor";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant } from "@home-assistant/frontend/src/types";

@customElement("chore-card")
class ChoreCard extends LitElement {
  static getConfigElement() {
    return document.createElement("chore-card-editor");
  }

  static getStubConfig(hass: HomeAssistant) {
    const stubEntity = hass.states;

    const entity = Object.values((hass as any).entities as any[]).find(
      (it) => it.entity_id.startsWith("sensor.") && it.platform === "chore"
    )?.entity_id;

    return entity
      ? {
          entity: entity,
          image: "https://picsum.photos/200/300",
        }
      : undefined;
  }

  static styles = css`
    :host {
      height: 100%;
      width: 100%;
      display: block;

    ha-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .header {
      flex: 0 0 auto;
    }

    img {
      flex: 1;
      height: 100%;
      width: auto;
      object-fit: cover;
      display: block;
    }
    `;
  @property()
  hass?: any;

  @state()
  private config?: any;

  // The user supplied configuration. Throw an exception and Home Assistant
  // will render an error card.
  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define an entity");
    }
    this.config = config;
  }

  render() {
    if (!this.hass || !this.config) {
      return;
    }

    const entityId = this.config.entity;
    const state = this.hass.states[entityId];
    const stateStr = state ? state.state : "unavailable";

    return html`
      <ha-card header="Example-card">
        <div class="header">The state of ${entityId} is ${stateStr}!</div>
        <img src="${this.config.image}" />
      </ha-card>
    `;
  }

  // The height of your card. Home Assistant uses this to automatically
  // distribute all cards over the available columns in masonry view
  // Applicable only in Massonry view
  getCardSize() {
    return 3;
  }

  getGridOptions() {
    return {
      rows: 3,
      columns: 6,
      min_rows: 1,
    };
  }
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "chore-card",
  name: "Chore",
  preview: true,
  documentationURL: "http://localhost:/do-be-added", // Adds a help link in the frontend card editor
});
