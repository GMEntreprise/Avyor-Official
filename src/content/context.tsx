import { createContext, useContext } from 'react';
import { routeFor, type Locale } from '../i18n/locales';
import type { SiteContent } from './types';

export interface Site {
  locale: Locale;
  content: SiteContent;
}

const SiteContext = createContext<Site | null>(null);
export const SiteProvider = SiteContext.Provider;

/** The language of the page being rendered, with everything written in it. */
export function useSite(): Site {
  const site = useContext(SiteContext);
  if (!site) throw new Error('useSite must be used inside <SiteProvider>');
  return site;
}

export const useUi = () => useSite().content.ui;

/** Links the current page to another one without leaving the language. */
export function useHref() {
  const { locale } = useSite();
  return (slug: string) => routeFor(locale, slug);
}
