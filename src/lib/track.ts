/** Conversion signal for whatever measurement the site is given later. No third party is loaded here. */
export function track(name: string) {
  window.dispatchEvent(new CustomEvent('avyor:conversion', { detail: { event: name } }));
}
