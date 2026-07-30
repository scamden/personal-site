// Everything on the page comes from here.
// Hero is a list of pieces so any word(s) can be emphasized (bold sans) or accented (slate).

export type HeroPiece = { t: string; b?: boolean; acc?: boolean };
// no href => "coming soon"; metaHref => the meta becomes a second link (e.g. repo + live demo in one row)
// inline => the title cell becomes several small links (e.g. a few merged fixes grouped in one row)
// feature => this link is pulled out of the list into a featured card (blurb = the sentence shown);
//   href is the "Source" link and metaHref is the primary "See it" demo link.
export type ResourceLink = {
  title: string;
  meta: string;
  href?: string;
  metaHref?: string;
  inline?: { label: string; href: string }[];
  feature?: string;
};
export type Section = {
  label: string;
  body: string[];
  note?: string;
  linksIntro?: string;
  links?: ResourceLink[];
};

export const site = {
  name: 'Sterling Camden',
  generation: 'V', // the fifth — a quiet suffix in the wordmark, not part of the surname
  url: 'https://sterlingcamden.com',
  seo: {
    title: 'Sterling Camden',
    description: 'Sterling Camden. I debug software for a living and belief for the love of it.',
  },

  hero: [
    { t: 'I ' },
    { t: 'debug', b: true },
    { t: ' software for a living and ' },
    { t: 'belief', b: true, acc: true },
    { t: ' for the love of it.' },
  ] satisfies HeroPiece[],

  sections: [
    {
      label: 'Thinking',
      body: [
        // thesis first, then the story, then what I'm chewing on now.
        'A former atheist who came to faith as an adult, now trying to get precise about it. Truth over tribe, possibility over certainty. I’d rather hold the hard questions honestly than reach for tidy answers.',
        'I fell hard into alcoholism in college and failed to quit more times than I can count. Then one desperate night, in the dead of winter on my mom’s back porch, I found myself saying out loud, over and over, “please don’t let me drink anymore.” Night by night it became “thank you that I’m not drinking.” Within two weeks I knew something miraculous was happening, though I hardly dared believe it. It set me free.',
        'That was nineteen years ago, and apart from one disastrous nine-month experiment two years in, I’ve been sober ever since. Slowly, I started seeing God in everything, from the wind to song lyrics. Eventually I went all in on Jesus, but that’s another story.',
        'Lately I’m chewing on consciousness, the limits of logic, and what actually sits at the truest core of my Christian experience.',
      ],
      note: 'A podcast about all this is coming. It’ll live here first.',
      linksIntro: 'A few voices I keep coming back to:',
      links: [
        {
          title: 'Alex O’Connor · CosmicSkeptic',
          meta: 'YouTube',
          href: 'https://www.youtube.com/@CosmicSkeptic',
        },
        {
          title: 'John Lennox',
          meta: 'Site',
          href: 'https://www.johnlennox.org/',
        },
        {
          title: 'David Bentley Hart',
          meta: 'Substack',
          href: 'https://davidbentleyhart.substack.com/',
        },
        {
          title: 'Donald Hoffman · is reality real?',
          meta: 'StarTalk',
          href: 'https://www.youtube.com/watch?v=GEtCYwr3quI',
        },
        {
          title: 'Kurt Gödel · incompleteness',
          meta: 'Encyclopedia',
          href: 'https://plato.stanford.edu/entries/goedel/',
        },
      ],
    },
    {
      label: 'Building',
      body: [
        'I build software for a living and for the pleasure of it. I care about finding the true shape of a system and expressing it as simply as it allows. Below is some public work. Some of it is mine, like the grid below, which I’m unreasonably proud of. A lot of it, though, lives in other people’s libraries, where I’ve gone in to fix a gnarly type or a subtle bug the maintainers hadn’t cornered yet. The best code says the right thing the simplest way.',
        'I miss crafting the code by hand, now that the machines do the writing. But the work just moved up a level, the search for the pattern underneath is the same as it ever was, and honestly I’m hopeful about what’s coming.',
      ],
      links: [
        // repo + live demo share one row (metaHref renders the meta as a second link)
        {
          title: 'the grid',
          meta: 'See it move',
          href: 'https://github.com/gridgrid/grid',
          metaHref: '/grid',
          feature:
            'A hand-built, test-first virtualized grid core from when a fast grid meant fighting the browsers of the day. It quietly powered RelateIQ, CreditIQ, and Airkit.',
        },
        {
          title: 'react-ts-form',
          meta: 'Core contributor',
          href: 'https://github.com/iway1/react-ts-form',
        },
        {
          title: 'jotai, mantine, webpack',
          meta: 'Merged fixes',
          inline: [
            {
              label: 'jotai',
              href: 'https://github.com/pmndrs/jotai/pulls?q=is%3Apr+author%3Ascamden+is%3Amerged',
            },
            {
              label: 'mantine',
              href: 'https://github.com/mantinedev/mantine/pulls?q=is%3Apr+author%3Ascamden+is%3Amerged',
            },
            {
              label: 'webpack',
              href: 'https://github.com/webpack/webpack/pulls?q=is%3Apr+author%3Ascamden+is%3Amerged',
            },
          ],
        },
        {
          title: 'ear-trainer',
          meta: 'Play it',
          href: 'https://github.com/scamden/ear-trainer',
          metaHref: 'https://ear-trainer-ynb.pages.dev/',
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
        'I write songs, play guitar, and sing more than I record, but some of it made it out into the world. These days I sometimes play in and lead worship, on electric or acoustic guitar and vocals. I also sang in [Stanford Talisman](https://acappella.stanford.edu/talisman) and directed it my senior year; that group, its people, and its music showed me what joy and goodness could look like, and let in some of my first light, even the Christian songs I found hard at the time.',
      ],
      links: [
        {
          title: 'All the Love You Gave',
          meta: 'Newer',
          href: 'https://soundcloud.com/sterling-camden-261510100/all-the-love-you-gave',
        },
        {
          title: 'My Friend',
          meta: 'Newer',
          href: 'https://soundcloud.com/sterling-camden-261510100/my-friend',
        },
        {
          title: 'this is not a christian rock album',
          meta: 'Older, drunker songs',
          href: 'https://soundcloud.com/sterling-camden-261510100/sets/this-is-not-a-christian-rock-album',
        },
        {
          title: 'Max’s First Word · Bang! Said Max',
          meta: 'The duo',
          href: 'https://soundcloud.com/maxs-first-word/sets/bang-said-max',
        },
        {
          title: 'Stanford Talisman · Your Voice Above the Storm',
          meta: 'Some solos and descants',
          href: 'https://music.apple.com/us/album/your-voice-above-the-storm/1516034944',
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
      ],
    },
    {
      label: 'Poems',
      body: [
        'I’ve written poems since middle school and never quite stopped. I majored in it for a while too, half out of love and half to sharpen my songwriting, until computer science won out. A handful are [collected here](/poems).',
      ],
    },
    {
      label: 'Outside',
      body: [
        'Snowboarding first, then climbing, then I gave climbing up to gamble on the ocean and fell hard for longboard surfing. Now I get to do both again. Anything outside and moving is the stuff.',
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
    { label: 'Email', href: 'mailto:hello@sterlingcamden.com' },
    { label: 'GitHub', href: 'https://github.com/scamden' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/scamden' },
  ],
};
