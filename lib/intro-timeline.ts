/** Cinematic brand film timeline (seconds) */
export const INTRO_TIMELINE = {
  videoFadeIn: 0,
  aurora: 0.5,
  logo: 1.0,
  tagline: 2.0,
  searchBar: 3.0,
  destinationPins: 3.5,
  interactive: 4.5,
  transitionToHero: 5.5,
} as const;

export const INTRO_DURATION_MS = INTRO_TIMELINE.transitionToHero * 1000;

export const INTRO_TAGLINE = "Book. Meet. Travel.";
