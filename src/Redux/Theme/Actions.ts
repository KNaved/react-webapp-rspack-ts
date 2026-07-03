import { createAction } from '@reduxjs/toolkit'
import type { DsPalette, SupportedColorScheme } from '@am92/react-design-system'

import type { T_THEME_REDUCER } from './TYPES'

export const setThemeSchemeAction = createAction<SupportedColorScheme, string>(
  'Theme/setThemeScheme'
)

export const setThemePaletteAction = createAction<DsPalette, string>(
  'Theme/setThemePalette'
)

export const setThemefontFamilyAction = createAction<string, string>(
  'Theme/setThemefontFamily'
)

export const setThemeAction = createAction<T_THEME_REDUCER, string>(
  'Theme/setTheme'
)
