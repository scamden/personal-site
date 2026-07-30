// Everything on the page comes from here.
// Hero is a list of pieces so any word(s) can be emphasized (bold sans) or accented (slate).

export type HeroPiece = { t: string; b?: boolean; acc?: boolean };
// no href => "coming soon"; metaHref => the meta becomes a second link (e.g. repo + live demo in one row)
export type ResourceLink = { title: string; meta: string; href?: string; metaHref?: string };
export type Section = { label: string; body: string[]; note?: string; links?: ResourceLink[] };

export const site = {
  name: 'Sterling Camden',
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
        'A former atheist who came to faith as an adult, now trying to get precise about it. Truth over tribe, possibility over certainty. I’d rather hold the real questions honestly than the tidy answers loosely.',
        'It started on a winter porch. I couldn’t stop drinking, and one night I found myself saying out loud, over and over, “please don’t let me drink anymore.” Night by night it became “thank you that I’m not drinking,” and then “who am I talking to?” Within two weeks I knew something miraculous was happening, though I hardly dared believe it. It set me free. That was nineteen years ago, and apart from one disastrous nine-month experiment in the middle, I’ve been sober ever since. Slowly, I started seeing God in everything, from the wind to song lyrics.',
        'Lately I’m chewing on consciousness, the limits of logic, and whether “why is there anything?” is a real question or a sentence that parses.',
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
        'I build software for a living and for the pleasure of it. I care about finding the true shape of a system and expressing it as simply as it allows. Some of my work is mine end to end, like a test-first, virtualized grid core I built by hand long ago, when that was genuinely hard, fast enough that it quietly powered RelateIQ, CreditIQ, and Airkit (I’m unreasonably proud of this old thing). Most of it, though, lives in other people’s libraries, where I’ve gone in to fix a gnarly type or a subtle bug the maintainers hadn’t cornered yet. The best code says the right thing the simplest way.',
      ],
      links: [
        // repo + live demo share one row (metaHref renders the meta as a second link)
        {
          title: 'gridgrid/grid',
          meta: 'See it move',
          href: 'https://github.com/gridgrid/grid',
          metaHref: '/grid',
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
        'I write songs, play guitar, and sing considerably more than I record, but some of it made it out into the world. These days I mostly play in and lead worship, on electric guitar and vocals. I also sang in Stanford Talisman and directed it my senior year.',
      ],
      links: [
        {
          title: 'My Friend',
          meta: 'Newer',
          href: 'https://soundcloud.com/sterling-camden-261510100/my-friend',
        },
        {
          title: 'All the Love You Gave',
          meta: 'Newer',
          href: 'https://soundcloud.com/sterling-camden-261510100/all-the-love-you-gave',
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
      label: 'Movement',
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
