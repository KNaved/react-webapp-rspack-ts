import type { WebHttpAxiosError } from '@am92/web-http'

import { setError } from '~/src/Redux/Error/Reducer'

import type { ErrorCodes, StatusCodes } from '~/src/Constants/ERROR_MAPPER'
import { ERROR_MAPPER } from '~/src/Constants/ERROR_MAPPER'
import { AppStore } from '~/src/Configurations/AppStore'

export const responseErrorInterceptor = async (error: WebHttpAxiosError) => {
  const { status, data } = error?.response || {}
  const errorCode = data?.errorCode as ErrorCodes
  const mappedError =
    ERROR_MAPPER[status as StatusCodes] ?? ERROR_MAPPER[errorCode]

  if (mappedError) {
    AppStore.dispatch(setError(mappedError))
  }

  return Promise.reject(error)
}
