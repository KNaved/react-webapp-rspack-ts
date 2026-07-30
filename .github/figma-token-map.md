# Figma → Design System Token Map

> Used by AI agents (GitHub Copilot + Figma MCP) when generating React components from Figma designs.
> All tokens map to `@am92/react-design-system`. Never hardcode hex values, px values, or raw strings.

---

## Color Tokens

> Source: https://storybook.staging.axisb.com/v2/?path=/story/getting-started-colours--colours

### Action Colors

| Figma Token Name  | CSS Variable                       | Light   | Dark    |
| ----------------- | ---------------------------------- | ------- | ------- |
| `actionPrimary`   | `var(--ds-colour-actionPrimary)`   | #97144D | #97144D |
| `actionSecondary` | `var(--ds-colour-actionSecondary)` | #ED1164 | #ED1164 |
| `actionTertiary`  | `var(--ds-colour-actionTertiary)`  | #0C746C | #0C746C |

### Surface Colors

| Figma Token Name    | CSS Variable                         | Light   | Dark    |
| ------------------- | ------------------------------------ | ------- | ------- |
| `surfaceBackground` | `var(--ds-colour-surfaceBackground)` | #FFFFFF | #282828 |
| `surfacePrimary`    | `var(--ds-colour-surfacePrimary)`    | #FFFFFF | #000000 |
| `surfaceSecondary`  | `var(--ds-colour-surfaceSecondary)`  | #F9F9F9 | #404040 |
| `surfaceTertiary`   | `var(--ds-colour-surfaceTertiary)`   | #404040 | #F9F9F9 |

### Typography Colors

| Figma Token Name       | CSS Variable                            | Light   | Dark    |
| ---------------------- | --------------------------------------- | ------- | ------- |
| `typoPrimary`          | `var(--ds-colour-typoPrimary)`          | #282828 | #F9F9F9 |
| `typoSecondary`        | `var(--ds-colour-typoSecondary)`        | #575757 | #E2E2E2 |
| `typoTertiary`         | `var(--ds-colour-typoTertiary)`         | #6E6E6E | #B4B4B4 |
| `typoActionPrimary`    | `var(--ds-colour-typoActionPrimary)`    | #97144D | #FFFFFF |
| `typoActionSecondary`  | `var(--ds-colour-typoActionSecondary)`  | #ED1164 | #ED1164 |
| `typoActionTertiary`   | `var(--ds-colour-typoActionTertiary)`   | #0C746C | #F3FBFB |
| `typoOnSurface`        | `var(--ds-colour-typoOnSurface)`        | #FFFFFF | #FFFFFF |
| `typoDisabled`         | `var(--ds-colour-typoDisabled)`         | #B4B4B4 | #9D9D9D |
| `typoTypical`          | `var(--ds-colour-typoTypical)`          | #165964 | #E3F5F8 |
| `typoOnSurfaceDynamic` | `var(--ds-colour-typoOnSurfaceDynamic)` | #FFFFFF | #282828 |

### Neutral Colors

| Figma Token Name | CSS Variable                | Light   | Dark    |
| ---------------- | --------------------------- | ------- | ------- |
| `neutral1`       | `var(--ds-colour-neutral1)` | #F1F4F7 | #0C1015 |
| `neutral2`       | `var(--ds-colour-neutral2)` | #EBF9F8 | #0F322F |
| `neutral3`       | `var(--ds-colour-neutral3)` | #EBF0F9 | #0F1B32 |
| `neutral4`       | `var(--ds-colour-neutral4)` | #F4EBF9 | #260F32 |
| `neutral5`       | `var(--ds-colour-neutral5)` | #F9F6EB | #322A0F |
| `neutral6`       | `var(--ds-colour-neutral6)` | #B8DDDB | #3D7F7C |

### Icon Colors

| Figma Token Name       | CSS Variable                            | Light   | Dark    |
| ---------------------- | --------------------------------------- | ------- | ------- |
| `iconNegative`         | `var(--ds-colour-iconNegative)`         | #EB0000 | #FF6C6C |
| `iconPositive`         | `var(--ds-colour-iconPositive)`         | #278829 | #62D264 |
| `iconWarning`          | `var(--ds-colour-iconWarning)`          | #D84008 | #F87647 |
| `iconActionPrimary`    | `var(--ds-colour-iconActionPrimary)`    | #97144D | #97144D |
| `iconActionSecondary`  | `var(--ds-colour-iconActionSecondary)`  | #ED1164 | #ED1164 |
| `iconActionTertiary`   | `var(--ds-colour-iconActionTertiary)`   | #0C746C | #F3FBFB |
| `iconOnSurface`        | `var(--ds-colour-iconOnSurface)`        | #FFFFFF | #FFFFFF |
| `iconDisabled`         | `var(--ds-colour-iconDisabled)`         | #B4B4B4 | #9D9D9D |
| `iconDefault`          | `var(--ds-colour-iconDefault)`          | #FFFFFF | #FFFFFF |
| `iconTypical`          | `var(--ds-colour-iconTypical)`          | #165964 | #E3F5F8 |
| `iconOnSurfaceDynamic` | `var(--ds-colour-iconOnSurfaceDynamic)` | #404040 | #282828 |

### Stroke / Border Colors

| Figma Token Name          | CSS Variable                               | Light   | Dark    |
| ------------------------- | ------------------------------------------ | ------- | ------- |
| `strokeDefault`           | `var(--ds-colour-strokeDefault)`           | #E2E2E2 | #6E6E6E |
| `strokeSelected`          | `var(--ds-colour-strokeSelected)`          | #F14687 | #F57BA9 |
| `strokeSecondarySelected` | `var(--ds-colour-strokeSecondarySelected)` | #81C1BD | #B8DDDB |
| `strokeHover`             | `var(--ds-colour-strokeHover)`             | #F9B0CC | #F9B0CC |
| `strokeDisabled`          | `var(--ds-colour-strokeDisabled)`          | #B4B4B4 | #9D9D9D |
| `strokeActive`            | `var(--ds-colour-strokeActive)`            | #404040 | #F9F9F9 |

### Support / Status Colors

| Figma Token Name         | CSS Variable                              | Light   | Dark    |
| ------------------------ | ----------------------------------------- | ------- | ------- |
| `supportNegative`        | `var(--ds-colour-supportNegative)`        | #EB0000 | #FF6C6C |
| `supportPositive`        | `var(--ds-colour-supportPositive)`        | #278829 | #62D264 |
| `supportWarning`         | `var(--ds-colour-supportWarning)`         | #D84008 | #F87647 |
| `supportVariable`        | `var(--ds-colour-supportVariable)`        | #145599 | #145599 |
| `supportTypical`         | `var(--ds-colour-supportTypical)`         | #165964 | #165964 |
| `supportNegativeNeutral` | `var(--ds-colour-supportNegativeNeutral)` | #F9EBEF | #320F19 |
| `supportPositiveNeutral` | `var(--ds-colour-supportPositiveNeutral)` | #EFF9EB | #0C1907 |
| `supportWarningNeutral`  | `var(--ds-colour-supportWarningNeutral)`  | #F9F1EB | #321E0F |
| `supportTypicalNeutral`  | `var(--ds-colour-supportTypicalNeutral)`  | #E3F5F8 | #E3F5F8 |

### State Colors

| Figma Token Name                | CSS Variable                                     | Light                  | Dark                   |
| ------------------------------- | ------------------------------------------------ | ---------------------- | ---------------------- |
| `stateSelectedPrimaryHover`     | `var(--ds-colour-stateSelectedPrimaryHover)`     | rgba(241,70,135,0.08)  | rgba(249,176,204,0.2)  |
| `stateSelectedPrimaryPressed`   | `var(--ds-colour-stateSelectedPrimaryPressed)`   | #F9B0CC                | #F9B0CC                |
| `stateSelectedSecondaryHover`   | `var(--ds-colour-stateSelectedSecondaryHover)`   | #F3FBFB                | #081919                |
| `stateSelectedSecondaryPressed` | `var(--ds-colour-stateSelectedSecondaryPressed)` | #E6F8F4                | #154B3F                |
| `stateSelectedVisitedTextLink`  | `var(--ds-colour-stateSelectedVisitedTextLink)`  | #9911ED                | #780DBB                |
| `stateUnselectedDefault`        | `var(--ds-colour-stateUnselectedDefault)`        | #B4B4B4                | #9D9D9D                |
| `stateUnselectedHover`          | `var(--ds-colour-stateUnselectedHover)`          | rgba(180,180,180,0.12) | rgba(180,180,180,0.2)  |
| `stateUnselectedPressed`        | `var(--ds-colour-stateUnselectedPressed)`        | rgba(180,180,180,0.16) | rgba(180,180,180,0.25) |
| `stateDisabledSurface`          | `var(--ds-colour-stateDisabledSurface)`          | #F1F1F1                | #404040                |

### Overlay Colors

| Figma Token Name | CSS Variable                     | Light                 | Dark            |
| ---------------- | -------------------------------- | --------------------- | --------------- |
| `overlay`        | `var(--ds-colour-overlay)`       | rgba(0,0,0,0.5)       | rgba(0,0,0,0.5) |
| `overlayLoader`  | `var(--ds-colour-overlayLoader)` | rgba(255,255,255,0.3) | rgba(0,0,0,0.3) |

### Data Visualisation Colors

> No CSS variables defined. Use raw hex values only in chart/graph contexts, never in UI components.

#### Categorical (unordered data)

| Swatch | Hex     |
| ------ | ------- |
| 1      | #C578D3 |
| 2      | #D84646 |
| 3      | #5273CC |
| 4      | #D87D23 |
| 5      | #29A597 |
| 6      | #2750C2 |
| 7      | #A03333 |

#### Sequential Palette 1 (Purple)

`#692675` → `#9636A7` → `#B757C8` → `#C578D3` → `#CD8AD9` → `#D9A5E2` → `#E4C0EB`

#### Sequential Palette 2 (Red)

`#6E1717` → `#9D2121` → `#CC2B2B` → `#D84646` → `#DD5F5F` → `#E58484` → `#EDA9A9`

#### Sequential Palette 3 (Teal)

`#134C45` → `#1B6D63` → `#238D81` → `#29A597` → `#31C4B3` → `#5CD6C8` → `#8DE2D8`

#### Sequential Palette 4 (Blue)

`#12265B` → `#1A3683` → `#2246AA` → `#2750C2` → `#3862D8` → `#6686E1` → `#94ABEA`

---

## Spacing Tokens

| Figma Spacing Value | CSS Variable                    | px    | rem   |
| ------------------- | ------------------------------- | ----- | ----- |
| `zero`              | `var(--ds-spacing-zero)`        | 0px   | 0     |
| `deepFreeze`        | `var(--ds-spacing-deepFreeze)`  | 2px   | 0.125 |
| `quickFreeze`       | `var(--ds-spacing-quickFreeze)` | 4px   | 0.25  |
| `glacial`           | `var(--ds-spacing-glacial)`     | 8px   | 0.5   |
| `frostbite`         | `var(--ds-spacing-frostbite)`   | 12px  | 0.75  |
| `bitterCold`        | `var(--ds-spacing-bitterCold)`  | 16px  | 1     |
| `cool`              | `var(--ds-spacing-cool)`        | 20px  | 1.25  |
| `mild`              | `var(--ds-spacing-mild)`        | 24px  | 1.5   |
| `pleasant`          | `var(--ds-spacing-pleasant)`    | 28px  | 1.75  |
| `warm`              | `var(--ds-spacing-warm)`        | 32px  | 2     |
| `tepid`             | `var(--ds-spacing-tepid)`       | 36px  | 2.25  |
| `tropical`          | `var(--ds-spacing-tropical)`    | 40px  | 2.5   |
| `hot`               | `var(--ds-spacing-hot)`         | 44px  | 2.75  |
| `blazing`           | `var(--ds-spacing-blazing)`     | 48px  | 3     |
| `molten`            | `var(--ds-spacing-molten)`      | 64px  | 4     |
| `superheated`       | `var(--ds-spacing-superheated)` | 80px  | 5     |
| `meltdown`          | `var(--ds-spacing-meltdown)`    | 96px  | 6     |
| `whiteHot`          | `var(--ds-spacing-whiteHot)`    | 112px | 7     |
| `plasma`            | `var(--ds-spacing-plasma)`      | 128px | 8     |

---

## Border Radius Tokens

| Figma Radius Value | CSS Variable                   | px   |
| ------------------ | ------------------------------ | ---- |
| `zero`             | `var(--ds-radius-zero)`        | 0px  |
| `deepFreeze`       | `var(--ds-radius-deepFreeze)`  | 2px  |
| `quickFreeze`      | `var(--ds-radius-quickFreeze)` | 4px  |
| `glacial`          | `var(--ds-radius-glacial)`     | 8px  |
| `frostbite`        | `var(--ds-radius-frostbite)`   | 12px |
| `bitterCold`       | `var(--ds-radius-bitterCold)`  | 16px |
| `cool`             | `var(--ds-radius-cool)`        | 20px |
| `mild`             | `var(--ds-radius-mild)`        | 24px |
| `pleasant`         | `var(--ds-radius-pleasant)`    | 28px |

---

## Typography Tokens

> Source: https://storybook.staging.axisb.com/v2/?path=/story/getting-started-typography--typography
> Font family: `"Lato", "Helvetica"` for all variants.
> Used via `<DsTypography variant="variantName">` from `@am92/react-design-system`.

### Display

| Figma Variant (`variant=`) | Weight | Size (mobile → desktop) | Line Height | Letter Spacing | Style  |
| -------------------------- | ------ | ----------------------- | ----------- | -------------- | ------ |
| `displayBoldLarge`         | 700    | 2.25rem → 3.5rem        | 1.107       | 0px            | —      |
| `displayBoldMedium`        | 700    | 2rem → 3rem             | 1.125       | 0px            | —      |
| `displayBoldSmall`         | 700    | 1.75rem → 2.5rem        | 1.1         | 0px            | —      |
| `displayBoldItalicLarge`   | 700    | 2.25rem → 3.5rem        | 1.107       | 0px            | italic |
| `displayBoldItalicMedium`  | 700    | 2rem → 3rem             | 1.125       | 0px            | italic |
| `displayBoldItalicSmall`   | 700    | 1.75rem → 2.5rem        | 1.1         | 0px            | italic |

### Heading

| Figma Variant (`variant=`)    | Weight | Size (mobile → desktop) | Line Height | Letter Spacing | Transform |
| ----------------------------- | ------ | ----------------------- | ----------- | -------------- | --------- |
| `headingBoldExtraLarge`       | 700    | 1.5rem → 2rem           | 1.3125      | 0px            | —         |
| `headingBoldLarge`            | 700    | 1.25rem → 1.5rem        | 1.333       | 0.16px         | —         |
| `headingBoldMedium`           | 700    | 1.125rem → 1.25rem      | 1.3         | 0.16px         | —         |
| `headingBoldSmall`            | 700    | 1.0625rem → 1.125rem    | 1.333       | 0.16px         | —         |
| `headingBoldExtraSmall`       | 700    | 1rem                    | 1.25        | 0.16px         | —         |
| `subheadingSemiboldLarge`     | 600    | 0.875rem                | 1.286       | 0.24px         | uppercase |
| `subheadingSemiboldDefault`   | 600    | 0.75rem                 | 1.333       | 0.24px         | uppercase |
| `headingBoldItalicExtraLarge` | 700    | 1.5rem → 2rem           | 1.3125      | 0px            | italic    |
| `headingBoldItalicLarge`      | 700    | 1.25rem → 1.5rem        | 1.333       | 0.16px         | italic    |
| `headingBoldItalicMedium`     | 700    | 1.125rem → 1.25rem      | 1.3         | 0.16px         | italic    |
| `headingBoldItalicSmall`      | 700    | 1.0625rem → 1.125rem    | 1.333       | 0.16px         | italic    |
| `headingBoldItalicExtraSmall` | 700    | 1rem                    | 1.25        | 0.16px         | italic    |

### Body

| Figma Variant (`variant=`) | Weight | Size     | Line Height | Letter Spacing |
| -------------------------- | ------ | -------- | ----------- | -------------- |
| `bodyRegularLarge`         | 400    | 1rem     | 1.5         | 0.16px         |
| `bodyRegularMedium`        | 400    | 0.875rem | 1.429       | 0.24px         |
| `bodyRegularSmall`         | 400    | 0.75rem  | 1.5         | 0.32px         |
| `bodyBoldLarge`            | 700    | 1rem     | 1.5         | 0.24px         |
| `bodyBoldMedium`           | 700    | 0.875rem | 1.429       | 0.24px         |
| `bodyBoldSmall`            | 700    | 0.75rem  | 1.5         | 0.32px         |
| `body1`                    | 400    | 1rem     | 1.5         | —              |
| `body2`                    | 400    | 0.875rem | 1.43        | —              |

### Support

| Figma Variant (`variant=`) | Weight | Size     | Line Height | Letter Spacing | Transform |
| -------------------------- | ------ | -------- | ----------- | -------------- | --------- |
| `supportRegularInfo`       | 400    | 0.688rem | 1.363       | 0.32px         | —         |
| `supportRegularFootnote`   | 400    | 0.625rem | 1.2         | 0.32px         | —         |
| `supportBoldTextButton`    | 700    | 0.75rem  | 1           | 1px            | uppercase |
| `supportRegularMetadata`   | 400    | 0.75rem  | 1           | 0.32px         | uppercase |
| `supportBlackProductName`  | 900    | 0.75rem  | 1           | 0.16px         | uppercase |

---

## Figma Component → React Component Map

| Figma Component Name          | React Component    | Import                           | Notes                                     |
| ----------------------------- | ------------------ | -------------------------------- | ----------------------------------------- |
| `Box` / `Container` / `Frame` | `<DsBox>`          | `@am92/react-design-system`      | Generic layout wrapper                    |
| `Stack` / `VStack` / `HStack` | `<DsStack>`        | `@am92/react-design-system`      | Use `direction`, `gap`, `padding` props   |
| `Grid`                        | `<DsGrid>`         | `@am92/react-design-system`      | Column-based layouts                      |
| `Button/Primary`              | `<DsButton>`       | `@am92/react-design-system`      | `variant="contained"`                     |
| `Button/Secondary`            | `<DsButton>`       | `@am92/react-design-system`      | `variant="outlined"`                      |
| `Button/Text`                 | `<DsButton>`       | `@am92/react-design-system`      | `variant="text"`                          |
| `IconButton`                  | `<DsIconButton>`   | `@am92/react-design-system`      | Icon-only button                          |
| `TextField` / `Input`         | `<DsTextField>`    | `@am92/react-design-system`      | Standard text input                       |
| `SearchInput`                 | `<DsSearchInput>`  | `~/src/Components/DsSearchInput` | Custom wrapper around `DsInputBase`       |
| `Autocomplete` / `Dropdown`   | `<DsAutoComplete>` | `@am92/react-design-system`      | Also see `~/src/Components/Autocomplete`  |
| `Typography/H1–H6`            | `<DsTypography>`   | `@am92/react-design-system`      | Use `variant` prop: `h1`–`h6`             |
| `Typography/Body`             | `<DsTypography>`   | `@am92/react-design-system`      | `variant="body1"` / `"body2"`             |
| `Typography/Caption`          | `<DsTypography>`   | `@am92/react-design-system`      | `variant="caption"`                       |
| `Link`                        | `<DsLink>`         | `@am92/react-design-system`      | Always add `rel="noreferrer"` if external |
| `Divider`                     | `<DsDivider>`      | `@am92/react-design-system`      |                                           |
| `Image`                       | `<DsImage>`        | `@am92/react-design-system`      | Use `srcSet` from asset constants         |
| `Skeleton` / `Shimmer`        | `<DsSkeleton>`     | `@am92/react-design-system`      | Loading placeholder                       |
| `Icon` / `RemixIcon`          | `<DsRemixIcon>`    | `@am92/react-design-system`      | Pass `className` for icon name            |
| `BottomSheet` / `Stagger`     | `<DsBottomSheet>`  | `@am92/react-design-system`      | Also see `~/src/HOCs/DsBottomSheetHOC`    |
| `Carousel` / `Slider`         | `<DsCarousel>`     | `@am92/react-design-system`      |                                           |
| `Loader` / `Spinner`          | `<DsLoader>`       | `@am92/react-design-system`      |                                           |
| `ListItem`                    | `<DsListItem>`     | `@am92/react-design-system`      |                                           |

---

## Responsive Layout Rules

- Use `withBreakpoints` HOC + `getDeviceActiveScreen` from `~/src/Utils/screenSize` for responsive logic.
- Responsive spacing via prop objects: `padding={{ xs: 'var(--ds-spacing-bitterCold)', md: 'var(--ds-spacing-mild)' }}`
- SCSS media query breakpoint: `@media (min-width: 768px)` for desktop.

---

## Enforcement Rules for AI Code Generation

1. **Never** output a hardcoded hex color — always use the CSS variable from the color table above.
2. **Never** output a hardcoded `px` spacing value — always use the spacing variable.
3. **Never** output a hardcoded `px` border-radius — always use the radius variable.
4. **Always** use a `Ds*` component from `@am92/react-design-system` before considering a custom HTML element.
5. Follow all patterns in `GUIDELINES.md` — `Readonly<Props>`, arrow function components, explicit return types, `useCallback` for handlers.
