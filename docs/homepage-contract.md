# Homepage Contract

Read this before changing the homepage hero, scrolling, or initial loading behavior.

## Required behavior

- The YouTube hero video is the homepage's primary visual effect. It attempts muted, looping autoplay on desktop and mobile. When the user prefers reduced motion, the static WebP fallback remains visible and the iframe stays disabled.
- The hero retains a static WebP background while the iframe loads or when the video is unavailable.
- Page scrolling uses native browser behavior. Wheel events remain passive and unblocked; page-level scroll snap and scripted smooth scrolling stay disabled.
- The scroll hint performs a direct jump to the game spotlight.
- Desktop and mobile layouts have no horizontal overflow.

## Performance comparisons

Keep every required behavior enabled in both the baseline and candidate build. Report third-party YouTube cost separately. A result obtained by removing or disabling the hero video is not a valid homepage comparison.

## Completion checks

1. Run `npm run verify` with Node.js 20.
2. Check the homepage at desktop and mobile viewport sizes.
3. Confirm the hero iframe becomes visible and YouTube reports playback.
4. Confirm normal wheel, Page Up, and Page Down scrolling without snapping or input blocking.
5. Confirm the scroll hint reaches the game spotlight and all public routes still render.
