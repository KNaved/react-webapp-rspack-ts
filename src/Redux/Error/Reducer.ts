import type { CreateSliceOptions } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { SLICE_NAME } from './Selectors'
import type { T_ERROR_REDUCER } from './TYPES'
import { INITIAL_STATE } from './TYPES'

const sliceOptions: CreateSliceOptions<T_ERROR_REDUCER> = {
  name: SLICE_NAME,
  initialState: INITIAL_STATE,
  reducers: {
    setError: (state, { payload }) => {
      state.errorCode = payload.errorCode
      state.message = payload.message
    },
    resetError: () => INITIAL_STATE
  }
}

const slice = createSlice(sliceOptions)

export const { setError, resetError } = slice.actions

export default slice.reducer
