import DynatraceHelper from '../Helpers/Dynatrace.Helper'
import { AppStore } from './AppStore'

import { setError } from '../Redux/Error/Reducer'
import { getErrorCodeSelector } from '../Redux/Error/Selectors'

import { ERROR_MAPPER, ErrorCodes } from '../Constants/ERROR_MAPPER'

export const disableDevtoolConfig = {
  disableMenu: false,
  ondevtoolopen: () => {
    const errorCode = getErrorCodeSelector(AppStore.getState())
    if (errorCode !== ErrorCodes.DisableDevtools) {
      DynatraceHelper.trace('Devtools Detected')
      AppStore.dispatch(setError(ERROR_MAPPER[ErrorCodes.DisableDevtools]))
    }
  }
}
