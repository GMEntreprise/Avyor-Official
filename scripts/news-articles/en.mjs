/*
 * The four News articles in English.
 *
 * A translation of the French reference, not a rewrite: same promise, same
 * structure, same decision tools. What changes is what has to change — the
 * wording, and the fact that the legal rules quoted are French ones, which is
 * said plainly each time they appear.
 *
 * Every AVYOR feature mentioned was checked in the application
 * (see docs/audits/avyor-content-audit.md).
 */
import {
  a,
  b,
  callout,
  doc,
  h2,
  h3,
  i,
  ol,
  p,
  table,
  ul,
  TEAM,
  LOI,
  LOI_8,
  DECRET,
} from './dsl.mjs';

const brief = {
  id: 'briefugcen01',
  slug: 'ugc-brief-what-to-specify',
  icon: 'context',
  coverAlt:
    'AVYOR illustration: a checklist card and a message bubble, in relief, on a midnight blue background.',
  article: {
    title: 'UGC brief: what to specify to avoid going back and forth',
    excerpt:
      'A polished video that misses the point usually comes from a vague brief. The five decisions to make before the shoot, an annotated example and a list to check.',
    type: 'guide',
    audience: 'brands',
    theme: 'prepare',
    author: TEAM.en,
    featured: true,
    cta: { label: 'Discover the brand journey', slug: 'brands' },
    related: ['choixcreaen1'],
    translations: {},
    sources: [LOI],
    seo: {
      title: 'UGC brief: what to specify before the shoot | AVYOR',
      description:
        'Audience, message, deliverables, constraints, approval and usage rights: what a UGC brief has to settle to avoid going back and forth, with an annotated example.',
    },
    body: doc(
      p(
        'The video arrives. The light is beautiful, the product well filmed, the tone natural. And yet it does not serve your campaign: it praises the wrong quality, it runs for a minute when fifteen seconds were needed, or it was shot horizontally. You ask for another version, the Creator does not see what was wrong, and a week goes by.',
      ),
      p(
        'Often the problem is not the video but the brief. ',
        b(
          'A brief avoids going back and forth when it settles five things before the shoot: who the video speaks to, the single message, the exact deliverables, what is fixed and what is free, and how the video will be approved and used.',
        ),
        ' The rest of this article goes through each of those decisions, with an annotated brief and a list to check before you send it.',
      ),
      callout(
        'example',
        p(
          b('UGC'),
          ' (',
          i('user-generated content'),
          ') here means content made by a Creator for a brand, which the brand generally publishes on its own channels: ads, product pages, its own social accounts. That is different from an influence post, published by the Creator to their own audience. Both are prepared with a brief, but not with the same expectations.',
        ),
      ),
      h2('Why a vague brief costs you rounds of revisions'),
      p(
        'A Creator who receives an incomplete brief does not stop: they fill the gaps with their own assumptions. They pick an angle, a length, a format, a tone. Those choices are often good in themselves, but they are not yours. You discover the gap on delivery, exactly when fixing it costs the most: another shoot instead of one more sentence in the brief.',
      ),
      p(
        'The most common instructions are also the most misleading. ',
        i('“An authentic video that showcases the product”'),
        ' says neither who it is for, nor which benefit, nor in what form. Anyone can agree with it, and that is precisely what makes it useless.',
      ),
      h2('The five decisions to make before writing'),
      h3('1. Who the video speaks to, and about which problem'),
      p(
        'Describe one precise person and the situation where your product helps them. ',
        i('“Women aged 25 to 35”'),
        ' is a marketing target; ',
        i('“someone who runs in the morning and whose bottle leaks inside their bag”'),
        ' is a scene the Creator can play. The more concrete the situation, the closer the video will land without you having to write it for them.',
      ),
      h3('2. The single message'),
      p(
        'A short video carries ',
        b('one message'),
        '. If you list six benefits, the Creator will pick one, or race through all of them so that none is remembered. Choose the one that matters to the person described above, and keep the others for other videos.',
      ),
      h3('3. The deliverables, down to the format'),
      p('This part is often forgotten, and yet it is the easiest to write. Specify:'),
      ul(
        'the number of videos, and their target length;',
        'the format: vertical 9:16, square, horizontal;',
        'what you expect exactly: edited video, raw files, or both;',
        'the useful variants: several hooks for the first three seconds, several endings;',
        'subtitles, music, on-screen text: who takes care of them.',
      ),
      h3('4. What is fixed, what is free'),
      p(
        'Split it into two lists. On one side, ',
        b('the non-negotiable points'),
        ': a disclosure to display, a claim that is not allowed, a gesture of use to show, a competing brand not to film. On the other, what you leave to the Creator: the setting, the words, the pace. Imposing a word-for-word script often removes the very thing you chose them for; dictate only the sentences that have to be dictated.',
      ),
      h3('5. Approval and usage rights'),
      p(
        'Say who approves, within what time, and how many rounds of revisions are included. Also state ',
        b('where, for how long and in which countries'),
        ' you will use the video: on your social accounts, in paid advertising, on your website. Those usage rights are part of the agreement; leaving them implicit only postpones the conversation to the moment it is hardest to have.',
      ),
      p(
        'If the Creator also publishes the video on their own account, the collaboration falls under commercial influence. In France, the law then requires a clear “Publicité” or “Collaboration commerciale” disclosure throughout the promotion (',
        a('French law no. 2023-451, article 5', LOI.url),
        '). If your campaign runs in France, plan for it in the brief; elsewhere, check the rules that apply to you.',
      ),
      h2('An annotated brief'),
      callout(
        'example',
        p(
          'Fictional product and brand, for illustration. Each row shows a vague instruction, its useful version, and what it prevents.',
        ),
      ),
      table(
        ['Section', 'Vague brief', 'Useful brief', 'What it prevents'],
        [
          'Audience',
          '“Sporty people”',
          '“Someone who runs before work and puts their bottle in their bag.”',
          'A performance angle when the real subject is a wet bag.',
        ],
        [
          'Message',
          '“Show everything the bottle does well”',
          '“It does not leak, even upside down in a bag.”',
          'Six benefits in fifteen seconds, none remembered.',
        ],
        [
          'Deliverables',
          '“A dynamic video”',
          '“Two vertical 9:16 videos of 15 to 20 s, three different hooks, raw files included.”',
          'A one-minute horizontal video that cannot be used as an ad.',
        ],
        [
          'Fixed / free',
          'Nothing specified',
          '“Show the bottle upside down above an open bag. Free: place, outfit, words. Not allowed: any claim about keeping drinks cold.”',
          'A claim the brand cannot prove.',
        ],
        [
          'Approval and use',
          'Nothing specified',
          '“Feedback within 48 h, one round of revisions included. Use: brand accounts and ads, 6 months, France.”',
          'A negotiation about rights after delivery.',
        ],
      ),
      h2('What is better left out'),
      ul(
        [
          b('Adjectives instead of decisions'),
          ': “authentic”, “dynamic”, “impactful” cannot be filmed.',
        ],
        [b('A list of benefits with no order'), ': if everything is a priority, nothing is.'],
        [b('A full script imposed'), ' when only two sentences are genuinely mandatory.'],
        [
          b('References the Creator cannot see'),
          ': “like our last campaign”, with no link to it.',
        ],
      ),
      h2('The list to check before sending'),
      callout(
        'checklist',
        ul(
          'The person you address and their situation are described in one or two sentences.',
          'One main message is written down in plain words.',
          'The number of videos, their length, format and variants are specified.',
          'The mandatory and forbidden points are separated from what is free.',
          'The approval time and the number of revision rounds included are stated.',
          'Usage rights — channels, duration, countries — are written down.',
          'A disclosure is planned if the Creator publishes on their own account.',
        ),
      ),
      h2('Inside AVYOR'),
      p(
        'The AVYOR campaign assistant goes through four steps: information, budget, targeting, then a review of the complete brief before publication. Targeting covers platforms, audience and deadline; the review is the right moment to go through the list above. The usage rights granted on a deliverable are the ones defined in the conditions of the accepted campaign: what you write there is the reference for both sides.',
      ),
    ),
  },
};

/* ================================================================ Article 2 */

const choose = {
  id: 'choixcreaen1',
  slug: 'choosing-a-creator-beyond-follower-count',
  icon: 'discover',
  coverAlt: 'AVYOR illustration: a compass in relief, violet and blue, on a midnight blue background.',
  article: {
    title: 'How to choose a Creator beyond follower count',
    excerpt:
      'Three proposals, three polished videos: which one fits your brand? A comparison grid tied to your campaign goal, and the signals that should give you pause.',
    type: 'guide',
    audience: 'brands',
    theme: 'choose',
    author: TEAM.en,
    featured: false,
    cta: { label: 'Discover the brand journey', slug: 'brands' },
    related: ['briefugcen01'],
    translations: {},
    sources: [],
    seo: {
      title: 'Choosing a Creator beyond follower count | AVYOR',
      description:
        'How to compare Creators against your campaign goal: how they explain a product, fit with your audience, deliverables, reliability. A grid you can reuse.',
    },
    body: doc(
      p(
        'You have received three proposals from Creators. The videos are polished, but you still do not know which one fits your brand. ',
        b(
          'Start by comparing how they explain a product, the deliverables they offer and the terms of the collaboration.',
        ),
        ' Follower count answers none of those questions on its own — and depending on your goal, it may not matter at all.',
      ),
      p(
        'This article gives you a method: start from the campaign goal, compare five observable criteria, then decide with a grid you can reuse as it is.',
      ),
      h2('First, your goal'),
      p('The first question is not “which Creator?” but “what do I need?”.'),
      ul(
        [
          b('Content for your own channels'),
          ' (ads, product pages, brand accounts): that is a UGC order. What matters is how good and how accurate the video is. The Creator’s audience will not be used.',
        ],
        [
          b('Being seen by a specific audience'),
          ': that is influence. The Creator’s audience becomes a criterion, but who it is made of matters more than how large it is.',
        ],
      ),
      p(
        'Many campaigns mix the two. Simply write down which one weighs more: it will decide for you when you hesitate.',
      ),
      h2('What follower count says, and what it does not'),
      p(
        'A follower count indicates the size of a potential audience, at a given moment. It says nothing about who that audience is made of, whether it resembles your customers, or whether the Creator knows how to present a product they did not choose. For a UGC order it says almost nothing useful: you are buying a video, not a broadcast.',
      ),
      h2('Five criteria to compare'),
      h3('How they explain a product'),
      p(
        'Watch two or three videos where the Creator presents something. Do you understand what the product is for within seconds? Do they show a gesture of use, or simply hold it up to the camera? What you see there is close to what you will receive.',
      ),
      h3('Fit with your audience'),
      p(
        'Do the tone, the setting and the pace match the people you are addressing? An excellent Creator can be the wrong choice if the way they speak does not sound like your customers.',
      ),
      h3('Execution quality'),
      p(
        'Sound audible without music, steady light, framing that reads on a phone, editing that goes straight to the point. These take a minute to check and prevent technical disappointments.',
      ),
      h3('The deliverables they offer'),
      p(
        'A Creator who offers hook variants, raw files or several formats makes the rest of your work easier. Compare what is included, not only the amount.',
      ),
      h3('Reliability of the collaboration'),
      p(
        'Are the answers clear? Do they ask questions about the brief? Do they agree to put deadlines, revisions and usage rights in writing? A good question before the shoot beats a good excuse after it.',
      ),
      h2('The comparison grid'),
      p(
        'Score each criterion from 1 to 3 for every Creator. The last column tells you which criteria weigh most, depending on your goal.',
      ),
      table(
        ['Criterion', 'What you look at', 'Where to see it', 'Priority'],
        [
          'Explaining the product',
          'The use is clear within seconds',
          'Portfolio, demo videos',
          'UGC: high · Influence: high',
        ],
        [
          'Fit with the audience',
          'Tone, setting and pace close to your customers',
          'Recent videos, profile',
          'UGC: medium · Influence: high',
        ],
        [
          'Execution quality',
          'Sound, light, framing, editing',
          'Two or three videos at random',
          'UGC: high · Influence: medium',
        ],
        [
          'Deliverables offered',
          'Variants, raw files, formats',
          'Proposal, conversation',
          'UGC: high · Influence: medium',
        ],
        [
          'Reliability',
          'Clear answers, questions about the brief',
          'First exchanges',
          'UGC: high · Influence: high',
        ],
        [
          'Audience',
          'Who it is made of, and how close to your customers',
          'Information provided by the Creator',
          'UGC: low · Influence: high',
        ],
      ),
      callout(
        'example',
        p(
          b('Illustrative example.'),
          ' A cosmetics brand wants videos for its ads. Creator A has the largest audience, but their product videos are static shots with no demonstration. Creator B has a modest audience, always shows the application gesture and offers three hooks. Creator C is close to the target audience but their sound is inaudible without music. For a UGC order the grid points to B: A’s audience will not be used, and C’s weakness sits on a priority criterion.',
        ),
      ),
      h2('Signals that should give you pause'),
      callout(
        'warning',
        ul(
          'A portfolio showing only one kind of video, with no product demonstration.',
          'Audience figures the Creator cannot or will not explain.',
          'A refusal to put deliverables, deadlines or usage rights in writing.',
          'No question about your brief, even when it leaves points open.',
        ),
      ),
      p(
        'None of these signals is disqualifying on its own. Together, they usually announce a difficult collaboration.',
      ),
      h2('Inside AVYOR'),
      p(
        'When AVYOR suggests a profile for your campaign, it shows the reasons behind the match: specialisation in your niche, presence on your target platforms, engagement rate, location and language, trust score, recent activity. Those reasons complement reading a portfolio, they do not replace it. You can then build a shortlist among the applications you receive before deciding; the decision remains yours.',
      ),
    ),
  },
};

/* ================================================================ Article 3 */

const portfolio = {
  id: 'portfolioen1',
  slug: 'ugc-portfolio-what-to-show-when-starting-out',
  icon: 'create',
  coverAlt: 'AVYOR illustration: a clapperboard in relief, violet, on a midnight blue background.',
  article: {
    title: 'UGC portfolio: what to show when you are starting out',
    excerpt:
      'No client yet, and a first campaign in sight? A portfolio shows how you work before it shows who you worked for. Five pieces to prepare, presented honestly, and what to remove.',
    type: 'guide',
    audience: 'creators',
    theme: 'create',
    author: TEAM.en,
    featured: false,
    cta: { label: 'Discover the Creator journey', slug: 'creators' },
    related: ['premiereen01'],
    translations: {},
    sources: [],
    seo: {
      title: 'UGC portfolio when starting out: what to show | AVYOR',
      description:
        'With no client, a UGC portfolio shows how you work: five videos to prepare, how to present personal projects honestly, and what to take out.',
    },
    body: doc(
      p(
        'You want to apply to your first campaign, but you have not worked for any brand yet. Your gallery holds holiday videos, two tutorials and an unboxing filmed a year ago. You hesitate to put yourself forward.',
      ),
      p(
        b(
          'A portfolio does not show who you worked for first: it shows how you work.',
        ),
        ' Three to five short videos, made for the occasion and presented honestly as personal projects, are enough to prove it. Here is which ones to prepare, and how to present them.',
      ),
      h2('What a brand looks for in a portfolio'),
      p('A brand going through your portfolio asks a few simple questions:'),
      ul(
        'Can they make a product understood within seconds?',
        'Are the sound, the light and the framing clean?',
        'Does the pace go straight to the point?',
        'Can they follow an instruction without losing their own voice?',
      ),
      p(
        'None of those questions requires a past client. They require videos made to answer them.',
      ),
      h2('Without a client: personal projects, presented as such'),
      p(
        'Film products you own and genuinely use, as if a brand had asked you to. It is the most direct way to show your work. One rule allows no exception: ',
        b('present these videos as personal projects'),
        '. Do not write “for brand X” and do not suggest a collaboration that never happened: a brand that notices will not forgive it, and you will have lost the very thing the portfolio was meant to prove.',
      ),
      callout(
        'example',
        p(
          b('An honest caption, for example: '),
          i(
            '“Personal project, not commissioned. Goal: show in 15 seconds that these headphones stay in place while running. Constraint I set myself: no on-screen text.”',
          ),
        ),
      ),
      h2('Five pieces for a first portfolio'),
      p(
        'Each one proves a different skill. You do not have to make them all; three well chosen beat five rushed.',
      ),
      table(
        ['Piece', 'Indicative length', 'What it proves'],
        [
          'Product hook',
          '10 to 15 s',
          'You catch attention and set out the problem in the first seconds.',
        ],
        ['Demo or tutorial', '30 to 45 s', 'You make a use understood, step by step.'],
        [
          'Piece to camera',
          '20 to 30 s',
          'You speak naturally about a product, without reading a script.',
        ],
        ['Unboxing', '20 to 40 s', 'You show off an object and its packaging, with no dead time.'],
        [
          'Before / after or lifestyle',
          '15 to 30 s',
          'You show a result, or a product in a believable everyday scene.',
        ],
      ),
      p(
        'These lengths are landmarks for a first set, not standards: always read the instructions of the campaign you are answering.',
      ),
      h2('Three lines of context under each video'),
      p('A video without context leaves the brand guessing what you were after. Add under each:'),
      ol(
        [b('The goal'), ': what the video had to make clear.'],
        [b('The constraint'), ': the rule you set yourself.'],
        [b('What you would change'), ': one sentence showing how you look at your own work.'],
      ),
      p(
        'The third line is often the one a brand remembers: it shows that you can take feedback.',
      ),
      h2('What is better taken out'),
      ul(
        'Videos whose sound is not audible without music.',
        'Content with no product and no message, however good: it answers none of the brand’s questions.',
        'Duplicates: two similar unboxings say the same thing.',
        'Anything that could suggest a partnership that does not exist.',
      ),
      h2('Before you apply'),
      callout(
        'checklist',
        ul(
          'Three to five videos, each proving a different skill.',
          'Every personal project is presented as one.',
          'Every video carries its three lines of context.',
          'The sound is audible without music on all of them.',
          'The formats requested by the campaign you target are represented.',
        ),
      ),
      h2('Inside AVYOR'),
      p(
        'A Creator’s portfolio on AVYOR sorts work by content type, and photos can feed it without going through the feed. To prepare your first pieces, the guided video templates cover seven families of formats — product hook, testimonial, lifestyle, unboxing, tutorial, before/after, storytelling — each with its steps, its length and its difficulty level.',
      ),
    ),
  },
};

/* ================================================================ Article 4 */

const firstCollab = {
  id: 'premiereen01',
  slug: 'first-brand-collaboration-what-to-clarify',
  icon: 'collaborate',
  coverAlt:
    'AVYOR illustration: two conversation bubbles in relief, blue and violet, on a midnight blue background.',
  article: {
    title: 'First collaboration with a brand: what to clarify',
    excerpt:
      'A brand likes your work and offers a collaboration. Before saying yes, five points to get in writing, a message template to ask for them, and what French law requires.',
    type: 'guide',
    audience: 'creators',
    theme: 'prepare',
    author: TEAM.en,
    featured: false,
    cta: { label: 'See the journey step by step', slug: 'how-it-works' },
    related: ['portfolioen1'],
    translations: {},
    sources: [LOI, LOI_8, DECRET],
    seo: {
      title: 'First brand collaboration: what to clarify | AVYOR',
      description:
        'Deliverables, schedule, payment, usage rights, disclosure: what to get in writing before accepting a first collaboration, and what French law requires.',
    },
    body: doc(
      p(
        'A brand has seen your work and offers a collaboration. That is good news, and the urge to answer “yes” straight away is natural. Yet most of the trouble in a first collaboration comes from what was not said at the start: one revision too many, a payment later than expected, a video used somewhere other than announced.',
      ),
      p(
        b(
          'Before accepting, get five points in writing: the deliverables, the schedule and revisions, the payment and when it arrives, the usage rights, and your disclosure obligations if you publish.',
        ),
        ' Asking these questions does not make you difficult: it is what the Creators brands like working with again do.',
      ),
      h2('1. The deliverables, precisely'),
      p(
        'Number of videos, length, format, variants, raw files or not: anything not written down risks being expected anyway. If the brief stays vague, rephrase it yourself and ask for confirmation. A sentence such as ',
        i(
          '“I deliver two vertical 20-second videos, edited, with three different hooks — is that right?”',
        ),
        ' prevents most misunderstandings.',
      ),
      h2('2. The schedule and revisions'),
      p(
        'Ask for the delivery date, how long the brand takes to answer, and ',
        b('how many rounds of revisions are included'),
        '. Separate a revision — adjusting a shot, shortening a sentence — from a new request, such as another angle or another product. The second is discussed separately.',
      ),
      h2('3. Payment: amount, form, moment'),
      p(
        'The amount, of course, but also its form: a fixed fee, a commission, gifted products, or a mix. And above all ',
        b('when the payment happens'),
        ': on order, on delivery, after approval? A gifted product is not a neutral payment: it is a benefit in kind, and French law counts it as one.',
      ),
      h2('4. Usage rights'),
      p(
        'Where will the brand use your video, for how long, in which countries? On its social accounts, in paid advertising, on its website? Those rights have value. A long advertising use is not negotiated like a single post on the brand’s account.',
      ),
      h2('5. If you publish on your own account: disclosure'),
      p(
        'When you promote a product to your own audience, that is commercial influence. In France, the law then requires a “Publicité” or “Collaboration commerciale” disclosure, ',
        i('clear, legible and identifiable'),
        ' throughout the promotion (',
        a('French law no. 2023-451, article 5', LOI.url),
        ').',
      ),
      p(
        'The same law requires a ',
        b('written contract'),
        ', with specific details — the identity of the parties, the nature of the assignments, the payment or the value of benefits in kind, the rights and obligations of each side — when the payments and benefits paid by the same advertiser over one year, for the same promotional purpose, reach ',
        b('1 000 € excluding tax'),
        '. That threshold was set by ',
        a('decree no. 2025-1137', DECRET.url),
        ', in force since 1 January 2026.',
      ),
      callout(
        'warning',
        p(
          'These rules apply in France and they change: the law has already been amended since it was passed, notably by ordinance no. 2024-978. Check the version in force on Légifrance when you sign. If you or the brand are based elsewhere, the applicable rules may differ. This article helps you ask the right questions; it does not replace legal advice for your situation.',
        ),
      ),
      p(
        'If you deliver a video that only the brand will publish, without posting it yourself, the situation is different: clarify with them who publishes, where, and with which disclosure.',
      ),
      h2('A message to clarify, ready to adapt'),
      callout(
        'example',
        p(
          i(
            '“Thank you for your proposal, I am interested in your product. Before I confirm, could you specify: the number of videos, their length and format; the delivery date and how many rounds of revisions are included; the payment and when it happens; where and for how long you will use the video; and whether you expect a post on my own account? As soon as I have these, I will confirm.”',
          ),
        ),
      ),
      h2('Before accepting'),
      callout(
        'checklist',
        ul(
          'The deliverables are written down: number, length, format, variants.',
          'The delivery date and the number of revision rounds included are set.',
          'The amount, its form and the moment of payment are known.',
          'Usage rights — channels, duration, countries — are specified.',
          'You know whether you publish on your own account, and with which disclosure.',
          'A written contract exists if the legal threshold is reached.',
        ),
      ),
      h2('Inside AVYOR'),
      p(
        'On AVYOR, the amount is discussed in the conversation with the brand, and either side can make a counter-offer. The collaboration only starts once the proposal is accepted; the brand then pays, and the money is held by AVYOR until it approves your deliverable. One thing to know before applying: ',
        b('an application that has been sent cannot be withdrawn from the app'),
        '. Ask your questions first, in the conversation.',
      ),
    ),
  },
};

export const articles = [
  { family: 'brief', ...brief },
  { family: 'choose', ...choose },
  { family: 'portfolio', ...portfolio },
  { family: 'first-collab', ...firstCollab },
];
