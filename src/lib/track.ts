/** Conversion signal for whatever measurement the site is given later. No third party is loaded here. */
export function track(name: string, detail: Record<string, string> = {}) {
  window.dispatchEvent(new CustomEvent('avyor:conversion', { detail: { event: name, ...detail } }));
}
