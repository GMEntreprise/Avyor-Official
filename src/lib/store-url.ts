/** Accept only HTTPS product pages on the two official store domains. */
export function storeUrl(value: string | undefined, store: 'apple' | 'google'): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return undefined;
    const valid =
      store === 'apple'
        ? url.hostname === 'apps.apple.com' && /\/id\d+$/.test(url.pathname)
        : url.hostname === 'play.google.com' &&
          url.pathname === '/store/apps/details' &&
          Boolean(url.searchParams.get('id'));
    return valid ? url.href : undefined;
  } catch {
    return undefined;
  }
}
