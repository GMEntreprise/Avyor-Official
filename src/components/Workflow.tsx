import { ArrowUpRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Title } from './Lines';
import { useHref, useUi } from '../content/context';
import { ordinal } from '../lib/utils';
export function Workflow() {
  const ui = useUi().workflow;
  const href = useHref();
  const workflows = { creator: ui.creator, brand: ui.brand };
  return (
    <section className="workflow container" id="how-it-works">
      <div className="section-heading">
        <p className="eyebrow">{ui.eyebrow}</p>
        <h2>
          <Title headline={ui.title} />
        </h2>
      </div>
      <Tabs defaultValue="creator">
        <TabsList className="tabs-list" aria-label={ui.tabsLabel}>
          <TabsTrigger value="creator">{ui.creatorTab}</TabsTrigger>
          <TabsTrigger value="brand">{ui.brandTab}</TabsTrigger>
        </TabsList>
        {Object.entries(workflows).map(([role, steps]) => (
          <TabsContent value={role} key={role} className="workflow-content">
            <div className="workflow-steps">
              {steps.map(([title, body], i) => (
                <article key={title}>
                  <span className="step-number">{ordinal(i)}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
            <a className="text-link" href={href('how-it-works')}>
              {ui.link} <ArrowUpRight size={17} />
            </a>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
