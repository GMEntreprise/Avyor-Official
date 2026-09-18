import type { DeepContent, Section } from '../types';
import legal from '../legal/en.json';

/** Long-form page bodies, loaded only by the page that displays them. */
const sectionsBySlug: Record<string, Section[]> = {
  creators: [
    {
      title: 'A portfolio that speaks for you.',
      body: 'Gather your projects in your profile: UGC videos, product demos, testimonials, unboxings, tutorials or photos. A brand discovers your style before the first message.',
      items: [
        'Show your world, your niches and your platforms.',
        'Sort your work by type of content.',
        'Keep your projects reachable from your profile.',
      ],
    },
    {
      title: 'Create without starting from nothing.',
      body: 'The app offers guided video templates, sorted by category — product hook, testimonial, lifestyle, unboxing, tutorial, before/after, storytelling. Each template states its number of steps, its duration and its difficulty level. The studio supports you from filming to choosing the cover.',
    },
    {
      title: 'Series and stories.',
      body: 'A format that continues is published as a series, episode after episode. Stories carry shorter, themed content. Your long and short formats live in the same profile.',
    },
    {
      title: 'Campaigns to explore.',
      body: 'Browse open campaigns, sorted by relevance, recency or popularity, and filter them by category, platform or remote format. Each campaign shows its brief, its terms and how well it matches your profile.',
      items: [
        'Your niches and platforms feed that match score.',
        'Budget and deadline are stated before you apply.',
        'Your favourite campaigns stay within reach.',
      ],
    },
    {
      title: 'Apply, then follow the answer.',
      body: 'An application that has been sent moves through visible stages: pending, under review, shortlisted, accepted, declined or completed. You know where you stand without chasing. An application that has been sent cannot be withdrawn from the app: if you change your mind, say so to the brand in the conversation.',
    },
    {
      title: 'The amount is discussed in the conversation.',
      body: 'Nothing is imposed. You and the brand agree on the fee in the messaging, and either side can make a counter-offer. The collaboration only starts once the offer is accepted.',
    },
    {
      title: 'A project followed through to the deliverable.',
      body: 'Once the offer is accepted, the brand pays and the money is held by AVYOR until your deliverable is approved. Conversation, stages and deliverables stay together in one place.',
    },
    {
      title: 'Getting paid after approval.',
      body: 'Your fee leaves when the deliverable is approved, never before. The payout screen separates each stage: collaboration paid, deliverable approved, transfer to your Stripe balance, then bank transfer. That last timeframe depends on your Stripe account’s payout schedule.',
    },
    {
      title: 'Your activity takes shape.',
      body: 'Your path brings together your progression, your missions, your badges and your activity timeline. Your statistics follow views, likes, saves, followers, portfolio and campaigns — to understand what works, with no promise of reach or income.',
    },
  ],
  brands: [
    {
      title: 'Start with the work.',
      body: 'The video feed shows styles, formats and worlds. Move from a piece of content to its Creator’s profile, then to their portfolio, and judge the work rather than a pitch.',
    },
    {
      title: 'A four-step campaign assistant.',
      body: 'Creating a campaign happens step by step: details, budget, targeting, then a review before publishing. Each step is checked, which keeps an incomplete brief from going out.',
      items: [
        'Details: cover image, title, category, description, goal.',
        'Budget: total envelope and amount per Creator.',
        'Targeting: platforms, audience, deadline.',
        'Review: the whole brief re-read before publishing.',
      ],
    },
    {
      title: 'Choose how you pay.',
      body: 'A campaign can pay a fixed fee, a commission, or a mix of both. You set the total envelope and the amount per Creator; the app checks that the two stay consistent.',
    },
    {
      title: 'Target who you want to reach.',
      body: 'Set the platforms you are aiming for, the age range, the gender and the expected follower count, along with the campaign deadline. Those criteria are used to surface your campaign to relevant profiles.',
    },
    {
      title: 'Recommendations you can actually read.',
      body: 'The compatibility score explains itself. Every suggested profile says why it fits: specialism in your niche, presence on your target platforms, engagement rate, compatible location and language, trust score, recent activity. The decision stays yours.',
      items: [
        'The reasons are shown, not just the score.',
        'You can filter and sort profiles yourself.',
        'Matching adds to reading a portfolio, it does not replace it.',
      ],
    },
    {
      title: 'Sorting applications.',
      body: 'Applications you receive are followed by status: pending, under review, shortlisted, accepted, declined, completed. You can build a shortlist of the profiles you keep before deciding.',
    },
    {
      title: 'Agreeing on the amount.',
      body: 'The fee is discussed with the Creator in the conversation, and either side can make a counter-offer. Once the offer is accepted, you pay: the money is held by AVYOR until you approve the deliverable.',
    },
    {
      title: 'Following the collaboration and approving.',
      body: 'Talk, follow the stages and receive the deliverables along the intended path. The payout to the Creator leaves on your approval. Your dashboard gathers the campaigns you have launched, your collaborations and your activity.',
    },
  ],
  features: [
    {
      title: 'Discover — the video feed.',
      body: 'The way into the product is the work itself. Content is browsed as video, and each piece leads to its author’s profile and then to their portfolio.',
    },
    {
      title: 'Discover — search and filter.',
      body: 'Campaigns and profiles can be filtered by category across nineteen niches, by platform, by remote format or by featured status. Campaigns sort by relevance, recency or popularity, and can be saved as favourites.',
    },
    {
      title: 'Create — guided templates and studio.',
      body: 'Seven families of video templates support the making, each with its steps, duration and difficulty level. The studio covers recording, simple editing, choosing the cover and reviewing before publishing.',
    },
    {
      title: 'Create — portfolio, series and stories.',
      body: 'A portfolio sorts your work by type of content. Series chain the episodes of one format; stories carry shorter content. Photos feed the portfolio without going through the feed.',
    },
    {
      title: 'Collaborate — campaigns and applications.',
      body: 'A campaign gathers the brief, the terms and the deadline. Applications move through statuses both sides can see, and the brand can shortlist the profiles it keeps.',
    },
    {
      title: 'Collaborate — messaging and agreement.',
      body: 'The conversation carries the project: it is where the amount is negotiated, counter-offer included, and where the context stays available for the whole collaboration.',
    },
    {
      title: 'Steer — payment and payout.',
      body: 'The agreed amount is held by AVYOR until the deliverable is approved. Tracking separates the payment, the approval, the transfer to the Stripe balance and the bank transfer.',
    },
    {
      title: 'Steer — progression and statistics.',
      body: 'Missions, badges, levels, projects and a timeline give a reading of your activity over time. Statistics detail views, likes, saves, followers, portfolio and campaigns.',
    },
  ],
  'how-it-works': [
    {
      title: 'Creator — create your profile.',
      body: 'When you sign up you choose your role, then fill in your activity, your goals, your niches, your platforms, your country and your language. That information feeds directly into the campaigns you will be shown.',
    },
    {
      title: 'Creator — publish your work.',
      body: 'Film with a guided template or from the studio, choose your cover, then publish. Your work joins your profile and your portfolio.',
    },
    {
      title: 'Creator — explore campaigns.',
      body: 'Browse open campaigns, filter them and read the brief: expected content, terms, budget, deadline and match score.',
    },
    {
      title: 'Creator — apply and agree.',
      body: 'Send your application, follow its status, then discuss the amount in the conversation. Either side can make a counter-offer until you agree.',
    },
    {
      title: 'Creator — deliver and receive.',
      body: 'Hand over your deliverable in the collaboration space. Once it is approved, your fee moves to your Stripe balance, then on to your bank.',
    },
    {
      title: 'Brand — describe your activity.',
      body: 'When you sign up you fill in your organisation, your sector, your goal, the kind of Creators you are looking for and your budget range.',
    },
    {
      title: 'Brand — create your campaign.',
      body: 'The assistant guides you through four steps: details, budget, targeting, review. You re-read the whole brief before publishing.',
    },
    {
      title: 'Brand — discover and shortlist.',
      body: 'Explore the feed, filter profiles, read the compatibility reasons offered and build your shortlist from the applications you receive.',
    },
    {
      title: 'Brand — agree and fund.',
      body: 'Settle the amount in the conversation, counter-offer included. On acceptance you pay: the money is held by AVYOR until your approval.',
    },
    {
      title: 'Brand — approve and pay out.',
      body: 'Receive the deliverable, ask for an adjustment if you need one, then approve. The payout to the Creator is triggered at that moment.',
    },
  ],
  security: [
    {
      title: 'Your account.',
      body: 'Authentication and sensitive changes go through Supabase. From the security settings you can change your password — with a strength indicator —, change your email address with verification by message, and review the sessions you are signed in on.',
    },
    {
      title: 'Deleting your account.',
      body: 'Deletion happens from Settings, then Security. The action is irreversible and asks for an explicit written confirmation before it runs. Finish any ongoing collaborations first: some records tied to a payment have to be kept for legal reasons.',
    },
    {
      title: 'What your profile shows.',
      body: 'Profile, videos and portfolio are meant to be seen: that is what the product is for. Conversations, on the other hand, are only visible to the people in them. Your notification and display preferences are set in the app.',
    },
    {
      title: 'The payment is held until approval.',
      body: 'Once the offer is accepted, the brand pays and the money is held by AVYOR. It is only released to the Creator once the deliverable is approved. Neither the Creator nor the brand holds the funds in the meantime.',
    },
    {
      title: 'The payout, stage by stage.',
      body: 'Four states are shown: collaboration paid, deliverable approved, transfer to the Stripe balance, bank transfer. The timing of the last one depends on the payout schedule of the Creator’s Stripe account; no timeframe is promised.',
    },
    {
      title: 'Reporting content or an account.',
      body: 'Reporting is available from a video, a conversation or a profile, with a reason to specify.',
      items: [
        'Spam, fake account or impersonation.',
        'Harassment, violence, unsolicited sexual content.',
        'Fraud or copyright infringement.',
        'Another reason, with a free comment.',
      ],
    },
    {
      title: 'Blocking a user.',
      body: 'Blocking happens in the same place as reporting and stops the interaction. It can be undone from your settings.',
    },
    {
      title: 'A problem during a collaboration?',
      body: 'Contact support and say which project it concerns. Never send passwords or full bank details by email. For abusive content or behaviour, use the report in the app: it reaches the team directly.',
    },
  ],
  download: [
    {
      title: 'What you can do in the app.',
      body: 'AVYOR brings into one app the steps that run from discovering a profile to an approved deliverable.',
      items: [
        'Discover: browse the video feed and Creator profiles.',
        'Campaigns: publish a brief or explore the open ones.',
        'Collaboration: follow the stages of a project and its deliverables.',
        'Portfolio: gather your work in a profile that represents you.',
        'Messages: keep a project’s exchanges with their context.',
      ],
    },
    {
      title: 'Creator or brand?',
      body: 'The journey adapts to what you do: showing your work and answering campaigns on the Creator side, describing a project and discovering profiles on the brand side. You choose when you create your account, and you can change it in your settings.',
    },
    {
      title: 'On which devices?',
      body: 'AVYOR is a mobile app, planned for iOS and Android. The official App Store and Google Play links will appear on this page as soon as they are published: no download link is shown before it has been verified, and no installation file is distributed outside the two stores.',
    },
    {
      title: 'What does it cost?',
      body: 'Creating an account and discovering profiles and campaigns are not paid features. Money only changes hands for the collaborations themselves: the brand funds the project and the Creator is paid once the deliverable is approved. Amounts and applicable fees are shown in the app before you commit to anything.',
    },
    {
      title: 'A question before you start?',
      body: 'The team can answer your questions about the product. Write to the official contact address, without sending passwords or bank details.',
    },
  ],
  contact: [
    {
      title: 'About the product.',
      body: 'Say whether you are a Creator or represent a brand, then describe what you need. It helps us answer with the right context.',
    },
    {
      title: 'About your account or your data.',
      body: 'Give the address linked to your account and the nature of your request. Never send passwords or card details.',
    },
    {
      title: 'To report content.',
      body: 'Abusive content or accounts are reported straight in the app, from the video, the conversation or the profile concerned: that is the fastest route. Write to us if reporting is not possible.',
    },
  ],
};

export const deep: DeepContent = {
  sectionsBySlug,
  legalDocs: legal as unknown as DeepContent['legalDocs'],
};
