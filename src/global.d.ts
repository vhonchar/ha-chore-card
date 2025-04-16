export {};

/**
 * HomeAssistant specific types
 */
declare global {
  interface Window {
    customCards?: any[];
    customCardFeatures?: any[]
  }
}