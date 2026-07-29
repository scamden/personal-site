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
    description: 'Sterling Camden — I debug software for a living, and belief for the love of it.',
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
        // arc opener — Sterling's own words; swap "Jesus" for Christianity/faith/God if preferred.
        'I was an atheist. Then I went all in on Jesus. Now I’m trying to get precise about it.',
        'Truth over tribe, possibility over certainty — I’d rather hold the real questions honestly than the tidy answers loosely. Lately: consciousness, the limits of logic, and whether “why is there anything?” is a real question or a sentence that parses.',
      ],
      note: 'A podcast about all this is coming — it’ll live here first.',
      links: [
        {
          title: 'Alex O’Connor — CosmicSkeptic',
          meta: 'YouTube',
          href: 'https://www.youtube.com/@CosmicSkeptic',
        },
        { title: 'The podcast — episode 01', meta: 'Coming soon' },
      ],
    },
    {
      label: 'Building',
      body: [
        'Software, for a living and for the pleasure of it — less about shipping fast, more about finding the true shape of a system and saying it as simply as it allows. The best code is the code I talked myself out of writing.',
      ],
      links: [
        { title: 'github.com/scamden', meta: 'All the code', href: 'https://github.com/scamden' },
      ],
    },
    {
      label: 'Music',
      body: [
        'I sang in Stanford Talisman and directed it my senior year. I write songs, play guitar, and sing considerably more than I record — but some of it made it out into the world.',
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
