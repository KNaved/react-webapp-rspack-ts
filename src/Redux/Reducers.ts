import { combineReducers, type ReducersMapObject } from 'redux'

import AuthReducer from './Auth/Reducer'
import { SLICE_NAME as AuthSliceName } from './Auth/Selectors'
import type { T_AUTH_REDUCER } from './Auth/TYPES'
import ErrorReducer from './Error/Reducer'
import { SLICE_NAME as ErrorSliceName } from './Error/Selectors'
import type { T_ERROR_REDUCER } from './Error/TYPES'
import ThemeReducer from './Theme/Reducer'
import { SLICE_NAME as ThemeSliceName } from './Theme/Selectors'
import type { T_THEME_REDUCER } from './Theme/TYPES'

import ServiceTrackerReducer from './ServiceTracker/Reducer'
import { SLICE_NAME as ServiceTrackerSliceName } from './ServiceTracker/Selectors'
import type { T_SERVICE_TRACKER_REDUCER } from './ServiceTracker/TYPES'

export type TReducers = {
  [AuthSliceName]: T_AUTH_REDUCER
  [ServiceTrackerSliceName]: T_SERVICE_TRACKER_REDUCER
  [ThemeSliceName]: T_THEME_REDUCER
  [ErrorSliceName]: T_ERROR_REDUCER
}

const reducers: ReducersMapObject<TReducers> = {
  [AuthSliceName]: AuthReducer,
  [ServiceTrackerSliceName]: ServiceTrackerReducer,
  [ThemeSliceName]: ThemeReducer,
  [ErrorSliceName]: ErrorReducer
}

export default combineReducers<ReducersMapObject<TReducers>>(reducers)

export const persistedReducers: (keyof TReducers)[] = []
