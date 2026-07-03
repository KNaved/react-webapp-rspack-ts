import { createSelector } from '@reduxjs/toolkit'

import type { TAppStore } from '~/src/Configurations/AppStore'

export const SLICE_NAME = 'error'

const select = (state: TAppStore) => state[SLICE_NAME]

export const getErrorCodeSelector = createSelector(
  [select],
  state => state.errorCode
)
