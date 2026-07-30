// Everything on the page comes from here. Copy is placeholder until the content pass.
// Hero is a list of pieces so any word(s) can be emphasized (bold sans) or accented (slate).

export type HeroPiece = { t: string; b?: boolean; acc?: boolean };
export type ResourceLink = { title: string; meta: string; href?: string }; // no href => "coming soon"
export type Section = { label: string; body: string[]; note?: string; links?: ResourceLink[] };

export const site = {
  name: 'Sterling Camden',
  url: 'https://sterlingcamden.com',
  seo: {
    title: 'Sterling Camden',
    description: 'Sterling Camden. I debug software for a living, and belief for the love of it.',
  },

  hero: [
    { t: 'I ' },
    { t: 'debug', b: true },
    { t: ' software for a living, and ' },
    { t: 'belief', b: true, acc: true },
    { t: ' for the love of it.' },
  ] satisfies HeroPiece[],

  sections: [
    {
      label: 'Thinking',
      body: [
        // arc opener in Sterling's own words; swap "Jesus" for Christianity/faith/God if preferred.
        'I was an atheist. Then I went all in on Jesus. Now I’m trying to get precise about it.',
        'Truth over tribe, possibility over certainty. I’d rather hold the real questions honestly than the tidy answers loosely. Lately: consciousness, the limits of logic, and whether “why is there anything?” is a real question or a sentence that parses.',
      ],
      note: 'A podcast about all this is coming. It’ll live here first.',
      links: [
        {
          title: 'Alex O’Connor · CosmicSkeptic',
          meta: 'YouTube',
          href: 'https://www.youtube.com/@CosmicSkeptic',
        },
        { title: 'The podcast · episode 01', meta: 'Coming soon' },
      ],
    },
    {
      label: 'Building',
      body: [
        'I build software for a living and for the pleasure of it. What I care about is finding the true shape of a system and saying it as simply as it allows. Some of it is my own, like a test-first, virtualized grid core I built by hand back when that was genuinely hard, fast enough that it quietly powered RelateIQ, CreditIQ, and Airkit. A lot of it lives in other people’s libraries, where I’ve gone in to fix a gnarly type or a subtle bug the maintainers hadn’t cornered yet. The best code says the right thing the simplest way.',
      ],
      links: [
        {
          title: 'gridgrid/grid',
          meta: 'Test-first virtualized grid core',
          href: 'https://github.com/gridgrid/grid',
        },
        {
          title: 'react-ts-form',
          meta: 'Core contributor',
          href: 'https://github.com/iway1/react-ts-form',
        },
        {
          title: 'jotai, mantine, webpack',
          meta: 'Merged fixes',
          href: 'https://github.com/search?q=author%3Ascamden+is%3Apr+is%3Amerged&type=pullrequests',
        },
        {
          title: 'ear-trainer',
          meta: 'A little app',
          href: 'https://github.com/scamden/ear-trainer',
        },
        {
          title: 'github.com/scamden',
          meta: 'Everything else',
          href: 'https://github.com/scamden',
        },
      ],
    },
    {
      label: 'Music',
      body: [
        'I write songs, play guitar, and sing considerably more than I record, but some of it made it out into the world. I also sang in Stanford Talisman and directed it my senior year.',
      ],
      links: [
        {
          title: 'Max’s First Word',
          meta: 'The duo',
          href: 'https://soundcloud.com/maxs-first-word',
        },
        {
          title: 'Solo recordings',
          meta: 'Older songs',
          href: 'https://soundcloud.com/sterling-camden-261510100',
        },
        {
          title: 'Talisman · Amazing Grace',
          meta: 'Live solo',
          href: 'https://youtu.be/gUCZ4YdUFZQ',
        },
        {
          title: 'Talisman · Motherless',
          meta: 'Live solo',
          href: 'https://youtu.be/KGSym6wicjQ',
        },
        {
          title: 'Talisman · One By One',
          meta: 'Descant',
          href: 'https://music.apple.com/us/album/one-by-one/1516034944?i=1516034945',
        },
      ],
    },
    {
      label: 'Moving',
      body: [
        'Longboard surfing and bouldering, plus whatever rock is outside when I can reach it. Not especially good at either. That has never once been the point.',
      ],
    },
  ] satisfies Section[],

  photo: {
    src: '/me.png',
    alt: 'Sterling Camden',
    captionTitle: 'The author',
    caption: 'Mid-laugh, hat on, somewhere the wind was doing something.',
  },

  // Warm closing invitation, shown above the contact links.
  closing: 'Oh good, you’re here. Want to talk about reality? Because I really do.',

  social: [
    { label: 'Email', href: 'mailto:sterling.camden@gmail.com' },
    { label: 'GitHub', href: 'https://github.com/scamden' },
    { label: 'X', href: 'https://twitter.com/scamden' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/scamden' },
  ],
};
