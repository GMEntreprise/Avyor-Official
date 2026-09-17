import legal from './legal.json';
import { sectionsBySlug } from './sections';
import type { DeepContent } from '../App';

/** Everything an inner page needs beyond the shared shell, in one chunk. */
export const deep: DeepContent = {
  sectionsBySlug,
  legalDocs: legal as unknown as DeepContent['legalDocs'],
};
