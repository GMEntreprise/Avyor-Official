import { hydrateRoot, createRoot } from 'react-dom/client';
import { App, type DeepContent } from './App';
import { startReveal } from './lib/reveal';
import './styles.css';
const root = document.getElementById('root')!;
const path = window.location.pathname;
const slug = path.replace(/^\/|\/$/g, '');
/**
 * Inner pages carry several thousand words that the home page never shows.
 * Loading them per route keeps that weight out of the bundle every visitor
 * downloads; the text is already in the prerendered HTML, so nothing waits on
 * this request to be readable.
 */
const deep: DeepContent | undefined = slug ? (await import('./content/deep')).deep : undefined;
const app = <App path={path} deep={deep} />;
if (root.querySelector('main')) hydrateRoot(root, app);
else createRoot(root).render(app);
startReveal();
