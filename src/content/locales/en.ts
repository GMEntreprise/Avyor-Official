import type { SiteContent } from '../types';

export const facts =
  'AVYOR is a mobile platform where Creators and brands work together. Discover profiles, launch campaigns and follow your projects in one place.';

export const en: SiteContent = {
  facts,
  faqs: [
    { q: 'What is AVYOR?', a: facts },
    {
      q: 'Who is AVYOR for?',
      a: 'For Creators who want to show their work and find collaborations, and for brands looking for profiles for their content campaigns. You choose your role when you sign up.',
    },
    {
      q: 'Is AVYOR free?',
      a: 'Creating an account, publishing your profile, browsing campaigns and discovering profiles are not paid features. Money only changes hands for collaborations: the brand funds the project, and the Creator is paid once the deliverable is approved. Amounts and applicable fees are shown in the app before you commit to anything.',
    },
    {
      q: 'How do I create a campaign?',
      a: 'A four-step assistant guides you: details (cover image, title, category, description, goal), budget (total envelope and amount per Creator, as a fixed fee, a commission or a mix), targeting (platforms, audience, deadline), then a review of the full brief before you publish.',
    },
    {
      q: 'How do I join a campaign?',
      a: 'From the Campaigns tab, filter by your niches and platforms, read the brief and the terms, then send your application. Its status then moves in front of you: pending, under review, shortlisted, accepted, declined or completed.',
    },
    {
      q: 'Can I cancel an application?',
      a: 'Not from the app for now: an application that has been sent cannot be withdrawn. If you no longer want to take it further, say so to the brand in the conversation; they can close the application on their side.',
    },
    {
      q: 'How does matching work?',
      a: 'AVYOR compares what a profile says with what a campaign asks for, then shows the reasons behind the match: niche specialism, presence on the targeted platforms, engagement rate, location and language, trust score, recent activity. The brand reads those reasons and remains free to choose.',
    },
    {
      q: 'How does a collaboration unfold?',
      a: 'A brand contacts you, or you apply to a campaign. You agree on the amount in the conversation, and either side can make a counter-offer. Once the offer is accepted the brand pays: the money is held by AVYOR until the brand approves the deliverable.',
    },
    {
      q: 'How and when do I get paid?',
      a: 'The transfer starts when the brand approves the deliverable, never before. The amount then moves to your Stripe balance, and on to your bank account according to that account’s payout schedule. The payout screen separates those stages for each collaboration. No timeframe is guaranteed by AVYOR: it depends on the payment provider.',
    },
    {
      q: 'Can I create a video from the app?',
      a: 'Yes. Guided templates cover seven families of formats — product hook, testimonial, lifestyle, unboxing, tutorial, before/after, storytelling — each with its own steps, duration and difficulty level. The studio supports you through recording, choosing the cover and reviewing before you publish.',
    },
    {
      q: 'How do I secure my account?',
      a: 'The security settings let you change your password with a strength indicator, update your email address with verification, and review the sessions you are signed in on. Authentication and sensitive changes go through Supabase.',
    },
    {
      q: 'How do I report content or block an account?',
      a: 'Reporting and blocking are available straight from a video, a conversation or a profile. A reason is asked for: spam, fake account, harassment, violence, unsolicited sexual content, fraud, copyright infringement, or something else. The team reviews every report.',
    },
    {
      q: 'How do I delete my account?',
      a: 'Go to Settings, then Security, and choose to delete your account. The action is irreversible and asks for an explicit written confirmation. Finish any ongoing collaborations first: some records tied to a payment have to be kept for legal reasons.',
    },
    {
      q: 'Is AVYOR available on iOS and Android?',
      a: 'AVYOR is a mobile app planned for iOS and Android. The public launch is being prepared: the official App Store and Google Play links will appear on the download page as soon as they exist. No installation file is distributed outside those two stores.',
    },
    {
      q: 'How do I contact AVYOR?',
      a: 'Write to the official contact address shown on the Contact page, saying whether you are a Creator or represent a brand. Never send passwords or full bank details.',
    },
    {
      q: 'Do the screenshots show real users?',
      a: 'The screenshots show AVYOR screens filled with demonstration data. Profiles, brands, amounts and statistics illustrate the journeys; they are not testimonials or client results.',
    },
  ],
  scenes: [
    {
      id: '02-matching',
      label: 'Discover',
      heading: 'A style is recognised. It is not summed up.',
      body: 'Browse profiles, watch the work and find the voices that fit your project.',
      tag: '01 / DISCOVER',
    },
    {
      id: '03-match-detail',
      label: 'Match',
      heading: 'Understand why it could work.',
      body: 'Read the compatibility details between a Creator and your campaign. The decision stays yours.',
      tag: '02 / MATCH',
    },
    {
      id: '05-campaign',
      label: 'Create a campaign',
      heading: 'Good work starts with a clear brief.',
      body: 'Set out your project, the content you expect and the terms of the collaboration in a campaign.',
      tag: '03 / CAMPAIGN',
    },
    {
      id: '06-collaboration',
      label: 'Collaborate',
      heading: 'From the first message to the final deliverable.',
      body: 'Keep messages and project stages in one space, so everyone moves with the same context.',
      tag: '04 / COLLABORATE',
    },
  ],
  pages: [
    {
      slug: '',
      label: 'Home',
      title: 'AVYOR — Creators and brands, connected by the work',
      description:
        'The right Creator. The right campaign. Discover AVYOR, the mobile app that brings together video discovery, campaigns, portfolios and collaborations between Creators and brands.',
      eyebrow: 'WHERE THE WORK MEETS THE BRAND',
      heading: 'The right Creator. The right campaign.',
      intro: facts,
    },
    {
      slug: 'creators',
      label: 'Creators',
      title: 'Creators: portfolio, campaigns and payouts | AVYOR',
      description:
        'Publish your videos with guided templates, build your portfolio, apply to campaigns, agree on the amount in the conversation and follow your payout once the work is approved.',
      eyebrow: 'FOR CREATORS',
      heading: 'Your work deserves the right encounters.',
      intro:
        'Your world, your videos, your way of creating. AVYOR gives you what you need to show them, find campaigns that fit, and carry the collaboration through to the payout.',
      screen: '08-portfolio',
    },
    {
      slug: 'brands',
      label: 'Brands',
      title: 'Brands: launch a campaign and find Creators | AVYOR',
      description:
        'Build your campaign in four steps, target platforms and audience, read the compatibility reasons behind each profile, shortlist and approve deliverables before any payout.',
      eyebrow: 'FOR BRANDS',
      heading: 'The right eye to tell your brand’s story.',
      intro:
        'See what Creators actually make, then build a campaign with a clear brief, precise targeting and terms both sides can read.',
      screen: '02-matching',
    },
    {
      slug: 'features',
      label: 'Product',
      title: 'The AVYOR product: discover, create, collaborate, steer',
      description:
        'Video feed, search by niche, guided video templates, portfolio, series and stories, campaigns, messaging with counter-offers, payout tracking and a progression path.',
      eyebrow: 'THE PRODUCT',
      heading: 'See. Find each other. Create together.',
      intro:
        'Four moments: discover the work, create your own, collaborate within a frame, steer what moves forward.',
      screen: '04-feed',
    },
    {
      slug: 'how-it-works',
      label: 'How it works',
      title: 'How AVYOR works — as a Creator or as a brand',
      description:
        'Both AVYOR journeys, step by step: profile, publishing, campaigns, applications, agreeing on the amount, deliverable, approval and payout. Five steps on each side.',
      eyebrow: 'HOW IT WORKS',
      heading: 'An encounter. A brief. A project.',
      intro: 'Two starting points, five steps each, one shared space to create together.',
      screen: '05-campaign',
    },
    {
      slug: 'security',
      label: 'Security',
      title: 'Account, payments and reporting on AVYOR',
      description:
        'Account security settings, permanent deletion, payment held until the deliverable is approved, payout tracking, reporting reasons and blocking inside AVYOR.',
      eyebrow: 'TRUST & CONTROL',
      heading: 'Creating together, with clear rules.',
      intro:
        'Understand what is shared, how a payment moves forward, and where to act when something goes wrong.',
      screen: '07-payment',
    },
    {
      slug: 'faq',
      label: 'FAQ',
      title: 'Frequently asked questions about AVYOR — product, payment, account',
      description:
        'How do campaigns, matching, negotiation and payments work on AVYOR? How do you secure or delete your account? The answers, checked against the app.',
      eyebrow: 'THE ANSWERS',
      heading: 'Before the first encounter.',
      intro: 'What is useful to know to understand AVYOR and prepare your first collaboration.',
    },
    {
      slug: 'download',
      label: 'Download',
      title: 'Download AVYOR — launching on iOS and Android',
      description:
        'The official AVYOR download links for iOS and Android will appear here as soon as they are published. Discover the product and get in touch with the team.',
      eyebrow: 'AVYOR, SOON IN YOUR HANDS',
      heading: 'The next encounter starts here.',
      intro:
        'AVYOR is a mobile app for iOS and Android. The public launch is being prepared: the official App Store and Google Play links will appear here as soon as they are published.',
      screen: '04-feed',
    },
    {
      slug: 'privacy',
      label: 'Privacy',
      title: 'AVYOR privacy policy — data and your rights',
      description:
        'Read the privacy policy of the AVYOR app: data, purposes, processors, retention and how to contact us to exercise your rights.',
      eyebrow: 'YOUR DATA',
      heading: 'Privacy policy.',
      intro:
        'The privacy information for the app, and the information specific to this presentation site.',
      noindex: true,
    },
    {
      slug: 'terms',
      label: 'Terms of use',
      title: 'AVYOR terms of use — accounts and collaborations',
      description:
        'Read the AVYOR terms of use: accounts, content, campaigns, usage rights, conduct rules, collaborations and payments.',
      eyebrow: 'THE RULES',
      heading: 'Terms of use.',
      intro:
        'The rules that govern the use of the AVYOR app and collaborations between Creators and brands.',
      noindex: true,
    },
    {
      slug: 'contact',
      label: 'Contact',
      title: 'Contact AVYOR — product, support and privacy',
      description:
        'Contact the AVYOR team about the product, a collaboration or your personal data, at the official support address.',
      eyebrow: 'LET’S TALK',
      heading: 'A question? Let’s talk.',
      intro:
        'A question about AVYOR, a campaign in mind, or help needed with your account? Get in touch with the team.',
    },
    {
      slug: 'legal',
      label: 'Legal notice',
      title: 'AVYOR legal notice — publisher and contact',
      description:
        'The available information about the publisher of AVYOR, intellectual property and the official contact. A document still being prepared for launch.',
      eyebrow: 'PUBLISHER INFORMATION',
      heading: 'Legal notice.',
      intro:
        'AVYOR is a mobile product operated by Shavod. The publishing information is gathered on this page.',
      noindex: true,
    },
    {
      slug: 'video',
      label: 'AVYOR video',
      title: 'Open a video in the AVYOR app',
      description:
        'This link leads to a video published on AVYOR. The app shows the video, who made it and the campaigns attached to it.',
      eyebrow: 'AVYOR LINK',
      heading: 'This video opens in the app.',
      intro:
        'AVYOR is a mobile app: Creators’ videos are watched there and offered to brands there. This site presents the product.',
      noindex: true,
    },
    {
      slug: 'creator',
      label: 'Creator profile',
      title: 'Open a Creator profile in the AVYOR app',
      description:
        'This link leads to a Creator’s profile on AVYOR: their portfolio, the formats they favour and their collaborations.',
      eyebrow: 'AVYOR LINK',
      heading: 'This profile opens in the app.',
      intro:
        'A Creator’s portfolio, their videos and the way they work are all in the AVYOR app.',
      noindex: true,
    },
    {
      slug: 'campaign',
      label: 'Campaign',
      title: 'Open a campaign in the AVYOR app',
      description:
        'This link leads to a campaign published by a brand on AVYOR: its brief, the expected deliverables and its terms.',
      eyebrow: 'AVYOR LINK',
      heading: 'This campaign opens in the app.',
      intro:
        'Campaigns are read and joined from the app, with their brief and their terms.',
      noindex: true,
    },
    {
      slug: 'collaboration',
      label: 'Collaboration',
      title: 'Open a collaboration in the AVYOR app',
      description:
        'This link leads to a private collaboration between a brand and a Creator. Its content is only available in the app.',
      eyebrow: 'PRIVATE LINK',
      heading: 'This collaboration stays in the app.',
      intro:
        'A collaboration holds a brief, deliverables and a payment. It concerns its two parties, and no one else.',
      noindex: true,
    },
    {
      slug: 'messages',
      label: 'Conversation',
      title: 'Open a conversation in the AVYOR app',
      description:
        'This link leads to a private conversation on AVYOR. It is only readable in the app, by the people in it.',
      eyebrow: 'PRIVATE LINK',
      heading: 'This conversation stays in the app.',
      intro:
        'Messages between a brand and a Creator are read in the app only, by the people concerned.',
      noindex: true,
    },
    {
      slug: 'auth/confirm',
      label: 'Email confirmation',
      title: 'Confirm your AVYOR email address',
      description:
        'This page accompanies the confirmation of an AVYOR account email. The confirmation itself finishes in the app.',
      eyebrow: 'YOUR ACCOUNT',
      heading: 'Finish the confirmation in the app.',
      intro:
        'Open this link on your phone, with AVYOR installed: the confirmation finishes there. This website validates nothing by itself.',
      noindex: true,
    },
    {
      slug: 'auth/reset-password',
      label: 'New password',
      title: 'Set a new AVYOR password',
      description:
        'This page accompanies an AVYOR password reset. The new password is entered in the app.',
      eyebrow: 'YOUR ACCOUNT',
      heading: 'Choose your password in the app.',
      intro:
        'Open this link on your phone, with AVYOR installed. If the link has expired or has already been used, ask for a new one from the sign-in screen.',
      noindex: true,
    },
    {
      slug: 'auth/callback',
      label: 'Sign-in return',
      title: 'AVYOR sign-in return',
      description:
        'This page is the return address of an AVYOR sign-in. It keeps nothing and validates nothing by itself.',
      eyebrow: 'YOUR ACCOUNT',
      heading: 'Pick up the sign-in in the app.',
      intro:
        'This address is a technical return after a sign-in. If you see this page, finish signing in inside the AVYOR app.',
      noindex: true,
    },
  ],
  related: {
    creators: {
      lead: 'What comes next on the Creator journey.',
      links: [
        ['The journey step by step', 'how-it-works'],
        ['The product in detail', 'features'],
        ['Payments and security', 'security'],
      ],
    },
    brands: {
      lead: 'Going further on the brand side.',
      links: [
        ['The product in detail', 'features'],
        ['The journey step by step', 'how-it-works'],
        ['Payments and security', 'security'],
      ],
    },
    features: {
      lead: 'See the product at work.',
      links: [
        ['The journey step by step', 'how-it-works'],
        ['For Creators', 'creators'],
        ['Download the app', 'download'],
      ],
    },
    'how-it-works': {
      lead: 'Choose your starting point.',
      links: [
        ['For Creators', 'creators'],
        ['For brands', 'brands'],
        ['Frequently asked questions', 'faq'],
      ],
    },
    security: {
      lead: 'The documents that set the rules.',
      links: [
        ['Privacy policy', 'privacy'],
        ['Terms of use', 'terms'],
        ['Frequently asked questions', 'faq'],
      ],
    },
    faq: {
      lead: 'The rules and the documents.',
      links: [
        ['Payments and security', 'security'],
        ['Privacy policy', 'privacy'],
        ['Terms of use', 'terms'],
      ],
    },
    download: {
      lead: 'Discover AVYOR before you install it.',
      links: [
        ['The product in detail', 'features'],
        ['The journey step by step', 'how-it-works'],
        ['Frequently asked questions', 'faq'],
      ],
    },
    contact: {
      lead: 'The answer may already be here.',
      links: [
        ['Frequently asked questions', 'faq'],
        ['Payments and security', 'security'],
        ['Download the app', 'download'],
      ],
    },
  },
  navigation: [
    ['Product', 'features'],
    ['Creators', 'creators'],
    ['Brands', 'brands'],
    ['Security', 'security'],
    ['FAQ', 'faq'],
  ],
  ui: {
    skipToContent: 'Skip to content',
    brandHome: 'AVYOR, home',
    nav: {
      main: 'Main navigation',
      mobile: 'Mobile navigation',
      open: 'Open menu',
      close: 'Close menu',
      menuTitle: 'AVYOR menu',
      menuDescription: 'Discover the product and choose your path.',
    },
    language: {
      label: 'Language',
      current: 'Current language',
      error: 'Could not switch language. Please try again.',
    },
    download: { app: 'Download the app', discover: 'Discover AVYOR' },
    store: {
      comingSoon: 'Coming soon',
      launching: 'The launch is being prepared.',
      talk: 'Let’s talk about your project',
      apple: { lead: 'Download on the', name: 'App Store' },
      google: { lead: 'Get it on', name: 'Google Play' },
    },
    media: {
      pauseVideo: 'Pause the video',
      playVideo: 'Play the video',
      pauseBackground: 'Pause the background',
      playBackground: 'Play the background',
      pause: 'Pause',
      play: 'Play',
    },
    demoCaption:
      'AVYOR screens · Demonstration data. Profiles, amounts and statistics are illustrative.',
    screen: {
      prefix: 'AVYOR screen',
      fallback: 'the app',
      scenes: {
        '04-feed': 'video feed',
        '02-matching': 'discovering Creators',
        '03-match-detail': 'compatibility with a campaign',
        '05-campaign': 'campaign brief',
        '06-collaboration': 'collaboration conversation',
        '07-payment': 'payment tracking',
        '08-portfolio': 'Creator portfolio',
      },
    },
    hero: {
      eyebrow: 'WHERE THE WORK MEETS THE BRAND',
      title: { lead: ['The right Creator.'], accent: ['The right', 'campaign.'] },
      description: [
        'Creators and brands, find each other.',
        'Create together. Keep the project in one place.',
      ],
      seeHow: 'See how it works',
      tagTop: 'TALENT SHOWS.',
      tagBottom: 'THE MATCH IS MADE.',
      explore: 'EXPLORE AVYOR',
    },
    manifesto: {
      eyebrow: 'ONE APP. TWO WORLDS. THE SAME MOMENTUM.',
      title: {
        lead: ['There is talent to discover.', 'Stories to tell.'],
        accent: ['And everything that can grow between the two.'],
      },
      body: 'AVYOR brings Creators and brands together in one mobile app: discover the work, find the right profiles and give your collaborations a frame.',
      pillars: [
        ['Discover', 'The video feed and Creator profiles.'],
        ['Create', 'Guided templates, studio and portfolio.'],
        ['Collaborate', 'Brief, messages and deliverables.'],
      ],
    },
    audiences: {
      eyebrow: '02 — EACH WITH THEIR OWN WORLD',
      title: { lead: ['Creation has two sides.'], accent: ['AVYOR connects them.'] },
      creator: {
        eyebrow: 'CREATORS',
        title: ['Let your work', 'speak for you.'],
        body: ['A portfolio for your world.', 'Campaigns for what comes next.'],
        link: 'Discover the Creator journey',
        alt: 'Demonstration visual: content creation outdoors',
      },
      brand: {
        eyebrow: 'BRANDS',
        title: ['Your story.', 'The right eye.'],
        body: ['Discover a style.', 'Build a collaboration.'],
        link: 'Discover the brand journey',
        alt: 'Demonstration visual: beauty content for a campaign',
      },
    },
    feed: {
      eyebrow: '03 — VIDEO FIRST. TALENT FIRST.',
      title: { lead: ['Talent shows.'], accent: ['So take a look.'] },
      body: 'An eye, an edit, a way of telling a story. See what Creators can do, straight from the video feed.',
      note: 'The work comes before the pitch.',
      link: 'Discover the AVYOR feed',
    },
    trust: {
      eyebrow: '06 — THE PROJECT HAS A FRAME',
      title: { lead: ['The whole project.'], accent: ['One single place.'] },
      lead: 'Conversation moves ideas forward. Clear stages move the collaboration forward.',
      cards: [
        [
          'The context stays.',
          'Messages and collaboration stages sit together. Find the exchanges again as the project evolves.',
        ],
        [
          'The payment is traceable.',
          'The brand funds the collaboration through Stripe. The transfer to the Creator follows approval of the deliverable and the terms of the project.',
        ],
        [
          'You stay in control.',
          'Account settings, reporting, blocking and support: the actions that matter stay within reach.',
        ],
      ],
      link: 'Understand payments and security',
    },
    story: {
      eyebrow: '01 — THE ENCOUNTER, THEN THE PROJECT',
      title: { lead: ['Fewer tools.'], accent: ['More creating.'] },
      lead: 'From the first look to the delivered project, one continuous thread.',
      link: 'Explore the product',
      inApp: 'IN THE APP',
      steps: 'Product steps',
    },
    workflow: {
      eyebrow: '04 — OVER TO YOU',
      title: { lead: ['Two journeys.'], accent: ['One same encounter.'] },
      tabsLabel: 'Your AVYOR journey',
      creatorTab: 'I am a Creator',
      brandTab: 'I am a brand',
      creator: [
        [
          'Show your work.',
          'Your profile, your videos, your portfolio. Give a concrete sense of your world.',
        ],
        [
          'Find your next project.',
          'Browse campaigns and pick the ones that match the way you create.',
        ],
        [
          'Create, then collaborate.',
          'Talk with the brand, share your deliverables and follow the stages of the project.',
        ],
      ],
      brand: [
        ['Set out your brief.', 'Present your campaign, the content you expect and the terms.'],
        [
          'Discover the right profiles.',
          'Watch the work, read the portfolios and the compatibility details.',
        ],
        [
          'Move the project forward.',
          'Keep messages, funding and approval of deliverables on the same path.',
        ],
      ],
      link: 'The journey in detail',
    },
    gallery: {
      eyebrow: '05 — THE PRODUCT, PLAINLY',
      title: { lead: ['A glimpse.'], accent: ['Real possibilities.'] },
      previous: 'Previous screenshots',
      next: 'Next screenshots',
      region: 'App screenshots, use the arrow keys to browse',
      shots: [
        ['04-feed', 'The work, first.', 'A feed to discover what Creators make.'],
        ['08-portfolio', 'Your world, in detail.', 'Projects gathered in one portfolio.'],
        ['05-campaign', 'A brief to understand each other.', 'The context of your next piece.'],
        ['06-collaboration', 'The project keeps its thread.', 'The conversation follows the work.'],
        [
          '03-match-detail',
          'The reasons behind the match.',
          'A reading of the compatibility details.',
        ],
      ],
    },
    faq: {
      eyebrow: 'THE QUESTIONS THAT MATTER',
      title: 'Shall we talk?',
      lead: 'A project also starts with the right answers.',
      link: 'Contact the team',
    },
    footer: {
      eyebrow: 'THE NEXT PROJECT STARTS WITH AN ENCOUNTER',
      title: { lead: ['What if this'], accent: ['were the one?'] },
      link: 'Find AVYOR',
      tagline: 'Where the work meets the brand.',
      navLabel: 'Footer links',
      columns: [
        [
          'Explore',
          [
            ['The product', 'features'],
            ['For Creators', 'creators'],
            ['For brands', 'brands'],
            ['How it works', 'how-it-works'],
          ],
        ],
        [
          'Get in touch',
          [
            ['Security & payments', 'security'],
            ['Frequently asked questions', 'faq'],
            ['Contact', 'contact'],
            ['Download', 'download'],
          ],
        ],
        [
          'The rules',
          [
            ['Privacy', 'privacy'],
            ['Terms of use', 'terms'],
            ['Legal notice', 'legal'],
          ],
        ],
      ],
      product: 'A Shavod product.',
      audience: 'Creators × Brands',
      top: 'Back to top ↑',
    },
    news: {
      label: 'News',
      intro: 'Practical advice to collaborate better. AVYOR updates to move forward.',
      metaTitle: 'AVYOR News — advice for Creators and brands',
      metaDescription:
        'Practical guides to prepare a collaboration, create content, choose a partner and follow results, plus verified updates from the AVYOR app.',
      eyebrow: 'NEWS',
      featured: 'Featured',
      latestEyebrow: 'NEWS',
      latestTitle: 'Latest articles',
      latestLink: 'All articles',
      searchLabel: 'Search articles',
      searchPlaceholder: 'Brief, portfolio, first collaboration…',
      submit: 'Search',
      audienceLabel: 'Audience',
      themeLabel: 'Topic',
      all: 'All',
      audiences: { brands: 'Brands', creators: 'Creators', both: 'Creators and brands' },
      themes: {
        prepare: 'Preparing a collaboration',
        create: 'Creating content',
        choose: 'Choosing a partner',
        measure: 'Following results',
      },
      types: { guide: 'Practical guide', product: 'AVYOR update', case: 'Case study' },
      results: (count) =>
        count === 0 ? 'No articles' : count === 1 ? '1 article' : `${count} articles`,
      empty: 'No article matches these criteria yet.',
      reset: 'Clear search and filters',
      loading: 'Searching…',
      error: 'The articles could not be loaded. Check your connection.',
      retry: 'Try again',
      pagination: 'Article pagination',
      previous: 'Previous page',
      next: 'Next page',
      page: (page, pages) => `Page ${page} of ${pages}`,
      readingTime: (minutes) => `${minutes} min read`,
      published: 'Published',
      updated: 'Updated',
      by: 'By',
      toc: 'In this article',
      sources: 'Sources',
      accessed: 'accessed',
      related: 'Read next',
      sectionLink: 'Link to this section',
      feed: 'AVYOR News RSS feed',
      callouts: { example: 'Example', checklist: 'Checklist', warning: 'Watch out' },
      dateLocale: 'en-GB',
    },
    llms: {
      stores: 'See the download page for the platforms currently available.',
      storesPending: 'The public launch is being prepared. No unverified store link is published.',
      demo: 'The screenshots contain demonstration data.',
      pages: 'Official pages',
      contact: 'Contact',
      languages: 'This site is published in several languages',
    },
    page: {
      breadcrumb: 'Breadcrumb',
      home: 'Home',
      writeTo: 'Write to',
    },
    appLink: {
      note: 'You are seeing this page because the link was opened without the AVYOR app, or from a computer.',
      privateNote:
        'This content is private. Nothing of it is shown here: knowing the address grants no access.',
      install: 'Install the app, then open the link again: it will land straight on the right place.',
    },
    notFound: {
      metaLabel: 'Page not found',
      metaTitle: 'Page not found — AVYOR',
      metaDescription:
        'This AVYOR page cannot be found. Find the Creator and brand journeys from the home page.',
      eyebrow: '404 — OUT OF FRAME',
      title: 'This page is no longer in frame.',
      lead: 'This address does not lead to any AVYOR page.',
      leadAt: ['The address ', ' does not lead to any AVYOR page.'],
      suggestion: 'You may have been looking for',
      back: 'Back to the home page',
      report: 'Report a broken link',
      destinationsLabel: 'Main pages',
      destinationsEyebrow: 'OR START AGAIN HERE',
    },
    legal: {
      updated: 'Last updated:',
      tocLabel: 'On this page',
      tocTitle: 'ON THIS PAGE',
      noticeTitle: 'A document still being prepared for launch.',
      notice: (pending) =>
        `${pending} section${pending > 1 ? 's' : ''} ${pending > 1 ? 'are' : 'is'} waiting on information the publisher has to provide. They are flagged in the text rather than filled in with an approximation.`,
      todoLabel: 'To be completed before publication:',
      contactTitle: 'Write to us',
      contactLead: 'For any question about this document:',
      crosslinks: 'Related documents',
      translationNotice:
        'Courtesy translation. The French version is the binding one in the event of any discrepancy.',
    },
  },
};
