---
name: Seishun Learning
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434656'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#747688'
  outline-variant: '#c4c5d9'
  surface-tint: '#124af0'
  primary: '#0040e0'
  on-primary: '#ffffff'
  primary-container: '#2e5bff'
  on-primary-container: '#efefff'
  inverse-primary: '#b8c3ff'
  secondary: '#006c46'
  on-secondary: '#ffffff'
  secondary-container: '#5cfbb2'
  on-secondary-container: '#007149'
  tertiary: '#7e4700'
  on-tertiary: '#ffffff'
  tertiary-container: '#a15c00'
  on-tertiary-container: '#ffeddf'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c3ff'
  on-primary-fixed: '#001356'
  on-primary-fixed-variant: '#0035be'
  secondary-fixed: '#5ffdb4'
  secondary-fixed-dim: '#3ae09a'
  on-secondary-fixed: '#002112'
  on-secondary-fixed-variant: '#005233'
  tertiary-fixed: '#ffdcbf'
  tertiary-fixed-dim: '#ffb874'
  on-tertiary-fixed: '#2d1600'
  on-tertiary-fixed-variant: '#6a3b00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-jp:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  margin-mobile: 16px
  gutter: 12px
  stack-sm: 4px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style

The design system is anchored in the concept of "Cognitive Flow"—a balance between the rigorous structure required for language acquisition and the playful momentum of gamified learning. It targets students and professionals who need a high-performance yet approachable tool.

The visual style is **Modern/Corporate with Soft Influences**. It borrows the cleanliness and efficiency of productivity SaaS but injects the warmth of educational apps through rounded geometry and vibrant accents. The UI stays out of the way during intense study sessions while using energetic color cues to reward progress and maintain user engagement.

## Colors

The palette is functional and high-contrast to ensure legibility during mobile use. 

- **Primary Blue (#2E5BFF)**: Used for core interaction points, primary buttons, and active navigation states. It represents focus and trust.
- **Success Green (#00C985)**: Reserved for positive feedback, completed lessons, and correct answers.
- **Warning Orange (#FF9500)**: Used for streak alerts, review reminders, and grammar points requiring attention.
- **Neutrals**: A range of cool grays provides the structural "skeleton." The background uses a very soft tint (#F8FAFC) to reduce eye strain compared to pure white, while interactive cards remain pure white to "pop" off the screen.

## Typography

The design system utilizes **Inter** for all UI elements and instructional text. Inter’s tall x-height and neutral character ensure that complex Japanese glyphs (Kanji/Kana) placed alongside Latin text do not feel cramped or visually mismatched.

- **Display-JP**: Specifically for large-scale Kanji/Kana presentation on flashcards.
- **Hierarchical Contrast**: Bold weights (700) are used for headlines and navigation to provide immediate orientation.
- **Readability**: Body text uses a generous 1.5x line height to ensure definitions and grammar explanations are easy to scan on small mobile displays.

## Layout & Spacing

This design system follows a **Fluid Grid** model optimized for mobile-first constraints. 

- **Grid System**: A standard 8px baseline grid ensures vertical rhythm.
- **Safe Zones**: Standardized 16px side margins prevent content from hugging the screen edges.
- **Card Layout**: Content is primarily organized into cards. Cards utilize 12px gutters when displayed in a 2-column grid (e.g., category selection).
- **Stacking**: Elements within a card use "stack-sm" (4px) for related metadata and "stack-md" (16px) for separating logical chunks like a word and its definition.

## Elevation & Depth

Visual hierarchy is established using **Ambient Shadows** and **Tonal Layers**. 

1. **The Base Layer**: The background (#F8FAFC) sits at the lowest elevation.
2. **The Interaction Layer**: Cards and input fields sit on top of the base. They use a subtle, highly diffused shadow (Y: 4px, Blur: 12px, 5% Opacity) to appear "lifted."
3. **The Active Layer**: During a press or drag, cards increase their shadow spread to simulate being pulled toward the user.
4. **Overlays**: Modals and bottom sheets use a 20% black backdrop tint to focus the user's attention, emphasizing depth through dimming the background.

## Shapes

The shape language is consistently **Rounded (Level 2)**. 

- **Cards & Containers**: 0.5rem (8px) radius provides a soft, friendly feel that avoids the "sharpness" of traditional enterprise apps.
- **Large Components**: Content-heavy sections like study cards or modular panels use `rounded-lg` (16px) to create a distinct, modern "bubble" appearance.
- **Interactive Elements**: Buttons and input fields mirror the card radius for a cohesive aesthetic.

## Components

### Buttons
- **Primary**: Full-width blue (#2E5BFF) with a 2px "bottom-edge" shadow of a darker shade to create a tactile, pressable feel similar to physical buttons.
- **Secondary**: White background with a 2px blue border.

### Study Cards
- **Structure**: High-contrast white containers. Large Kanji characters centered in the upper half. Lower half contains hidden or secondary metadata (Furigana, English definition).
- **Feedback**: Cards flash green (#00C985) or orange (#FF9500) briefly upon user response.

### Progress Bars
- **Style**: Thick (8px-12px) tracks with fully rounded ends. The track uses a light gray, while the progress fill uses Primary Blue or Success Green.

### Chips & Categories
- **Icons**: Simple, monolinear icons. 
- **Labeling**: Kanji category (e.g., N5, N4) displayed in a small, pill-shaped badge within the chip.

### Input Fields
- **State**: Default fields have a subtle gray border. On focus, the border transitions to 2px Primary Blue with a soft outer glow.