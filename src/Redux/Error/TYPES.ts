export type T_ERROR_REDUCER = {
  errorCode: string
  message?: string
}

export const INITIAL_STATE: T_ERROR_REDUCER = {
  errorCode: '',
  message: ''
}
