import { renderToString } from 'react-dom/server';
import { App } from './App';
import { deep } from './content/deep';
export { pages, faqs, facts } from './content/site';
export { config } from './config';
export function render(path: string) {
  return renderToString(<App path={path} deep={deep} />);
}
