/**
 * Dates as a reader expects them in their language.
 *
 * Pinned to one time zone so the prerendered page and the browser agree on
 * the day an article went out — a reader in Montreal must not see a date the
 * server never wrote.
 */
export function formatDate(iso: string, dateLocale: string) {
  return new Intl.DateTimeFormat(dateLocale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Paris',
  }).format(new Date(iso));
}

/** Same calendar day in Paris: an update that day is not worth announcing. */
export const sameDay = (a: string, b: string) => formatDate(a, 'en-CA') === formatDate(b, 'en-CA');
