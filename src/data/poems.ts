// Poem text lives verbatim in ./poems/*.txt (imported raw) so the verse stays
// pristine and code-formatter-safe. This file is just the manifest + order.

import awake from './poems/awake.txt?raw';
import goldfish from './poems/goldfish.txt?raw';
import hokas from './poems/hokas.txt?raw';
import ourStorm from './poems/our-storm.txt?raw';
import pens from './poems/pens.txt?raw';
import sleeptalking from './poems/sleeptalking.txt?raw';
import blockUniverse from './poems/the-block-universe.txt?raw';
import toMeetAgain from './poems/to-meet-again.txt?raw';

export type Poem = {
  slug: string;
  title: string;
  text: string;
  // optional provenance line; may contain inline [text](href) markdown links
  note?: string;
};

// Order is a reading arc, not chronology: sharp opener, a wry breath, adult
// faith, tenderness, the love note, the sestina, a peak, then the long close.
export const poems = [
  { slug: 'goldfish', title: 'Goldfish', text: goldfish },
  { slug: 'pens', title: 'pens', text: pens },
  { slug: 'hokas', title: 'Hokas in the land of cul-de-sacs', text: hokas },
  { slug: 'awake', title: 'awake!', text: awake },
  { slug: 'to-meet-again', title: 'to meet again', text: toMeetAgain },
  { slug: 'our-storm', title: 'Our Storm', text: ourStorm },
  { slug: 'the-block-universe', title: 'The Block Universe', text: blockUniverse },
  {
    slug: 'sleeptalking',
    title: 'Sleeptalking',
    text: sleeptalking,
    note: 'Written for [Stanford Talisman](https://acappella.stanford.edu/talisman)’s spring 2004 show, read in pieces between songs.',
  },
] satisfies Poem[];

// Poems held back for now, kept here so the reasons aren't lost.
export const heldPoems = [
  {
    title: 'sacrament',
    reason:
      'Strong through the “call what’s left heart” couplet, then collapses into meta-doubt and a thesis-stating ending. Revise the back half before publishing.',
  },
  {
    title: 'Sterling Wyatt Camden IV',
    reason:
      'Ask dad first. A true moment, but no longer the end of the story now that he has returned to faith.',
  },
  {
    title: 'an explanation of my skin',
    reason: 'Ask dad before publishing.',
  },
] satisfies { title: string; reason: string }[];
