import { Fragment } from 'react';
import type { Headline } from '../content/types';

/**
 * Renders a sentence that is written with its own line breaks.
 *
 * A break carries a space with it: read aloud or copied out, the sentence must
 * stay a sentence rather than run two words together.
 */
export function Lines({ text, breakClass }: { text: string[]; breakClass?: string }) {
  return text.map((line, i) => (
    <Fragment key={i}>
      {i > 0 && (
        <>
          <br className={breakClass} />{' '}
        </>
      )}
      {line}
    </Fragment>
  ));
}

/**
 * A display heading with its emphasised ending.
 *
 * Each language decides where its own sentence breaks, so the line breaks
 * travel with the text instead of being frozen in the markup.
 */
export function Title({ headline, breakClass }: { headline: Headline; breakClass?: string }) {
  return (
    <>
      <Lines text={headline.lead} />
      {headline.accent && (
        <>
          <br />{' '}
          <span>
            <Lines text={headline.accent} breakClass={breakClass} />
          </span>
        </>
      )}
    </>
  );
}
