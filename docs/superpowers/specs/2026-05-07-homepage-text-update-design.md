# Homepage Text Update Design

**Date:** 2026-05-07  
**Status:** Approved

## Overview

Update the homepage tagline text from "A fun & amazing fireworks simulation game that will blow your mind!" to "Fun and amazing fireworks simulator that will blow your mind!" across both SEO meta tags and the animated homepage display.

## Objectives

- Modernize the tagline by removing the article "A" for a more direct, punchy statement
- Simplify "simulation game" to "simulator" for brevity and clarity
- Maintain consistency between meta tags and visible content
- Preserve the existing three-block animation structure while improving phrase boundaries

## Files to Modify

### 1. `public/index.html`
**Lines affected:** 13, 20, 28

Update meta description tags:
- Standard meta description (line 13)
- Open Graph description for Facebook (line 20)
- Twitter card description (line 28)

**Change:**
```
Old: "A fun and amazing fireworks simulation game that will blow your mind. Try it now for free!"
New: "Fun and amazing fireworks simulator that will blow your mind. Try it now for free!"
```

### 2. `src/pages/MainPage.js`
**Lines affected:** 151, 168, 185

Update the three animated text blocks within the motion.div components.

## Design Details

### Animation Block Restructuring

**Current structure:**
1. Block 1 (line 151): "A fun & amazing"
2. Block 2 (line 168): "fireworks simulation game" (currently appears empty/missing)
3. Block 3 (line 185): "that will blow your mind!"

**New structure:**
1. Block 1 (line 151): "Fun and amazing"
2. Block 2 (line 168): "fireworks simulator"
3. Block 3 (line 185): "that will blow your mind!"

### Rationale for Block Structure

The new structure creates more natural phrase boundaries:
- "Fun and amazing" - Complete descriptive phrase
- "fireworks simulator" - Complete subject/noun phrase
- "that will blow your mind!" - Complete impact statement

Each block now represents a complete thought unit, improving readability and visual flow during the staggered animation sequence.

### Animation Timing

No changes to animation timing are required. The existing `cardVariants`, `cardVariants2`, and `cardVariants3` from `src/data/MotionVariants.js` will continue to work with the new text structure.

## Implementation Steps

1. Update `public/index.html`:
   - Replace text in meta description (line 13)
   - Replace text in og:description (line 20)
   - Replace text in twitter:description (line 28)

2. Update `src/pages/MainPage.js`:
   - Change line 151: "A fun & amazing" → "Fun and amazing"
   - Change line 168: Add "fireworks simulator" (currently empty)
   - Line 185 remains unchanged: "that will blow your mind!"

3. Test the changes:
   - Verify meta tags render correctly in browser inspector
   - Verify social media preview cards show updated text
   - Verify homepage animation displays all three text blocks correctly
   - Check animation timing and visual flow

## Success Criteria

- All meta tags display "Fun and amazing fireworks simulator that will blow your mind. Try it now for free!"
- Homepage animation shows three distinct text blocks with proper timing
- No visual regressions in animation sequence
- Text is consistent across all locations (HTML meta tags and React component)

## Notes

- The change from "&" to "and" in MainPage.js improves consistency with the HTML meta tags
- The middle animation block (line 168) appears to be empty in the current code and needs the "fireworks simulator" text added
- No changes to animation variants, timing constants, or CSS are required