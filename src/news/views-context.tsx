import { createContext, useContext } from 'react';

export type NewsViews = typeof import('./views');

const NewsViewsContext = createContext<NewsViews | null>(null);
export const NewsViewsProvider = NewsViewsContext.Provider;

/** The reading views, when the page loaded them — null everywhere else. */
export const useNewsViews = () => useContext(NewsViewsContext);
