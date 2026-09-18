/**
 * The shape every language fills in.
 *
 * One object per language holds everything a visitor can read, so a missing
 * translation is a type error at build time rather than a French sentence
 * left in an Arabic page.
 */

export interface Section {
  title: string;
  body: string;
  items?: string[];
}

export interface Page {
  /** The address is the same in every language; only the text changes. */
  slug: string;
  label: string;
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  intro: string;
  screen?: string;
  noindex?: boolean;
}

export interface Faq {
  q: string;
  a: string;
}

export interface Scene {
  id: string;
  label: string;
  heading: string;
  body: string;
  tag: string;
}

/**
 * A display heading, split the way it is meant to break on screen.
 * `accent` is the emphasised end of the sentence.
 */
export interface Headline {
  lead: string[];
  accent?: string[];
}

/** Contextual next step at the end of a page: label plus the slug it leads to. */
export interface RelatedBlock {
  lead: string;
  links: [label: string, slug: string][];
}

export interface Ui {
  skipToContent: string;
  brandHome: string;
  nav: {
    main: string;
    mobile: string;
    open: string;
    close: string;
    menuTitle: string;
    menuDescription: string;
  };
  language: {
    /** Names the control itself, for its label and its menu. */
    label: string;
    /** Announced on the trigger, before the language currently in use. */
    current: string;
    error: string;
  };
  download: {
    app: string;
    discover: string;
  };
  store: {
    comingSoon: string;
    launching: string;
    talk: string;
    /** Two lines per button: what the visitor does, then where. */
    apple: { lead: string; name: string };
    google: { lead: string; name: string };
  };
  media: {
    pauseVideo: string;
    playVideo: string;
    pauseBackground: string;
    playBackground: string;
    pause: string;
    play: string;
  };
  demoCaption: string;
  screen: {
    /** Prefixes the name of the screen in an alt text. */
    prefix: string;
    fallback: string;
    scenes: Record<string, string>;
  };
  hero: {
    eyebrow: string;
    title: Headline;
    description: string[];
    seeHow: string;
    tagTop: string;
    tagBottom: string;
    explore: string;
  };
  manifesto: {
    eyebrow: string;
    title: Headline;
    body: string;
    pillars: [verb: string, detail: string][];
  };
  audiences: {
    eyebrow: string;
    title: Headline;
    creator: {
      eyebrow: string;
      title: string[];
      body: string[];
      link: string;
      alt: string;
    };
    brand: {
      eyebrow: string;
      title: string[];
      body: string[];
      link: string;
      alt: string;
    };
  };
  feed: {
    eyebrow: string;
    title: Headline;
    body: string;
    note: string;
    link: string;
  };
  trust: {
    eyebrow: string;
    title: Headline;
    lead: string;
    cards: [title: string, body: string][];
    link: string;
  };
  story: {
    eyebrow: string;
    title: Headline;
    lead: string;
    link: string;
    /** Overline above the phone: "IN THE APP / <screen>". */
    inApp: string;
    steps: string;
  };
  workflow: {
    eyebrow: string;
    title: Headline;
    tabsLabel: string;
    creatorTab: string;
    brandTab: string;
    creator: [title: string, body: string][];
    brand: [title: string, body: string][];
    link: string;
  };
  gallery: {
    eyebrow: string;
    title: Headline;
    previous: string;
    next: string;
    region: string;
    shots: [scene: string, title: string, body: string][];
  };
  faq: {
    eyebrow: string;
    title: string;
    lead: string;
    link: string;
  };
  footer: {
    eyebrow: string;
    title: Headline;
    link: string;
    tagline: string;
    navLabel: string;
    columns: [heading: string, links: [label: string, slug: string][]][];
    product: string;
    audience: string;
    top: string;
  };
  news: {
    /** Navigation label and page title of the section. */
    label: string;
    intro: string;
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
    featured: string;
    latestEyebrow: string;
    latestTitle: string;
    latestLink: string;
    searchLabel: string;
    searchPlaceholder: string;
    submit: string;
    audienceLabel: string;
    themeLabel: string;
    all: string;
    audiences: Record<'brands' | 'creators' | 'both', string>;
    themes: Record<'prepare' | 'create' | 'choose' | 'measure', string>;
    types: Record<'guide' | 'product' | 'case', string>;
    results: (count: number) => string;
    empty: string;
    reset: string;
    loading: string;
    error: string;
    retry: string;
    pagination: string;
    previous: string;
    next: string;
    page: (page: number, pages: number) => string;
    readingTime: (minutes: number) => string;
    published: string;
    updated: string;
    by: string;
    toc: string;
    sources: string;
    accessed: string;
    related: string;
    sectionLink: string;
    feed: string;
    callouts: Record<'example' | 'checklist' | 'warning', string>;
    /** BCP 47 locale used to write dates. */
    dateLocale: string;
  };
  /** The plain-text summary published at /llms.txt for machine readers. */
  llms: {
    stores: string;
    storesPending: string;
    demo: string;
    pages: string;
    contact: string;
    languages: string;
  };
  page: {
    breadcrumb: string;
    home: string;
    writeTo: string;
  };
  notFound: {
    /** Page metadata for the single not-found document. */
    metaLabel: string;
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
    title: string;
    lead: string;
    leadAt: [before: string, after: string];
    suggestion: string;
    back: string;
    report: string;
    destinationsLabel: string;
    destinationsEyebrow: string;
  };
  legal: {
    updated: string;
    tocLabel: string;
    tocTitle: string;
    noticeTitle: string;
    /** "{n} section(s) await an information the publisher must provide." */
    notice: (pending: number) => string;
    todoLabel: string;
    contactTitle: string;
    contactLead: string;
    crosslinks: string;
    /** Shown on a translated document: the French text is the binding one. */
    translationNotice?: string;
  };
}

export interface SiteContent {
  /** One sentence that describes the product, reused as a default description. */
  facts: string;
  faqs: Faq[];
  scenes: Scene[];
  pages: Page[];
  related: Record<string, RelatedBlock>;
  navigation: [label: string, slug: string][];
  ui: Ui;
}

export interface LegalSection {
  id: string;
  title: string;
  body?: string;
  items?: string[];
  todo?: string;
}

export interface LegalDoc {
  title: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
}

/** The long-form text only one page ever needs, loaded per route. */
export interface DeepContent {
  sectionsBySlug: Record<string, Section[]>;
  legalDocs: Record<string, LegalDoc>;
}
