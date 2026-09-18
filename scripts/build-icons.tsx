import { renderToStaticMarkup } from 'react-dom/server';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import {
  DiscoverIcon,
  CreateIcon,
  CollaborateIcon,
  ContextIcon,
  PaymentIcon,
  ControlIcon,
} from '../src/components/Icons3D';

/**
 * Turns the icon components into static SVG files.
 *
 * The icons are pure illustration: no state, no events. Rendered inline they
 * travelled in the JavaScript every visitor downloads and hydrates, on every
 * page. As files they leave the bundle, load lazily near their section, and
 * each one is its own document — its gradient ids can no longer collide with
 * another icon's.
 *
 * The components stay the source of the drawing. This runs before every build
 * and every dev server start, so the files cannot fall behind it.
 */
const icons = {
  discover: DiscoverIcon,
  create: CreateIcon,
  collaborate: CollaborateIcon,
  context: ContextIcon,
  payment: PaymentIcon,
  control: ControlIcon,
};

const dir = 'src/assets/icons';
mkdirSync(dir, { recursive: true });
let changed = 0;
for (const [name, Icon] of Object.entries(icons)) {
  const markup = renderToStaticMarkup(<Icon size={120} />)
    // A standalone SVG needs its namespace, or it will not render as an image.
    .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')
    // As an image it is announced through the img's alt, not its own attributes.
    .replace(' aria-hidden="true"', '')
    .replace(' focusable="false"', '');
  const path = `${dir}/${name}.svg`;
  const content = markup + '\n';
  if (!existsSync(path) || readFileSync(path, 'utf8') !== content) {
    writeFileSync(path, content);
    changed++;
  }
}
console.log(`${Object.keys(icons).length} icônes, ${changed} régénérée(s).`);
