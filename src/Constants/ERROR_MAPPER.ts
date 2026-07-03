export enum ErrorCodes {
  DisableDevtools = 'DISABLE_DEVTOOLS_DETECTED'
}

export enum StatusCodes {
  TooManyRequests = 429
}

interface IErrorMessage {
  errorCode: string
  message?: string
}

type TErrorKey = ErrorCodes | StatusCodes

export const ERROR_MAPPER: Record<TErrorKey, IErrorMessage> = {
  [StatusCodes.TooManyRequests]: {
    errorCode: 'API_LIMIT_REACHED'
  },
  [ErrorCodes.DisableDevtools]: {
    errorCode: 'DISABLE_DEVTOOLS_DETECTED'
  }
}
