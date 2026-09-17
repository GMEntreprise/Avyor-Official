import { ArrowUpRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ordinal } from '../lib/utils';
const workflows = {
  creator: [
    [
      'Montrez votre travail.',
      'Votre profil, vos vidéos, votre portfolio. Donnez un aperçu concret de votre univers.',
    ],
    [
      'Trouvez votre prochain projet.',
      'Explorez les campagnes et choisissez celles qui correspondent à votre façon de créer.',
    ],
    [
      'Créez, puis collaborez.',
      'Échangez avec la marque, partagez vos livrables et suivez les étapes du projet.',
    ],
  ],
  brand: [
    [
      'Posez votre brief.',
      'Présentez votre campagne, les contenus attendus et les conditions de collaboration.',
    ],
    [
      'Découvrez les bons profils.',
      'Regardez les créations, consultez les portfolios et les informations de compatibilité.',
    ],
    [
      'Faites avancer le projet.',
      'Gardez messages, financement et validation des livrables dans le même parcours.',
    ],
  ],
};
export function Workflow() {
  return (
    <section className="workflow container" id="how-it-works">
      <div className="section-heading">
        <p className="eyebrow">04 — À VOUS DE JOUER</p>
        <h2>
          Deux parcours.
          <br />
          <span>Une même rencontre.</span>
        </h2>
      </div>
      <Tabs defaultValue="creator">
        <TabsList className="tabs-list" aria-label="Votre parcours AVYOR">
          <TabsTrigger value="creator">Je suis Creator</TabsTrigger>
          <TabsTrigger value="brand">Je suis une marque</TabsTrigger>
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
            <a className="text-link" href="/how-it-works/">
              Le parcours en détail <ArrowUpRight size={17} />
            </a>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
