import { HomeAssistant } from '@home-assistant/frontend/src/types';
import { html, LitElement, TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';

export abstract class BaseCard<T> extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() protected config!: T;

  willUpdate(changedProps: Map<string, unknown>) {
    if (!this.hass && !changedProps.get('hass')) {
      throw new Error('Missing required property: hass');
    }
  }

  setConfig(config: T) {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    this.config = config;
  }

  render(): TemplateResult {
    if (!this.hass || !this.config) return html``;

    return this.renderBody();
  }

  abstract renderBody(): TemplateResult;
}
