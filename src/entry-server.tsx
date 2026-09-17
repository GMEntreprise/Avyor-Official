import { renderToString } from 'react-dom/server';
import { App } from './App';
import { deep } from './content/deep';
export { pages, faqs, facts } from './content/site';
export { config } from './config';
export { introScript } from './components/intro-session';
export function render(path: string) {
  return renderToString(<App path={path} deep={deep} />);
}
