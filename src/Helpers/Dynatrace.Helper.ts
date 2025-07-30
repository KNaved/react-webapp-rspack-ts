// Maps JavaScript primitive types to Dynatrace-compatible data types.
const JS_DT_DATATYPE_MAP = {
  number: 'javaDouble',
  object: 'date',
  string: 'shortString'
} as const

// ---------------------- Dynatrace Custom Property Types ----------------------
// A wrapper type to represent a value being tracked, with an optional `public` visibility flag.
type TypedProperty<T> = {
  value: T // The actual value (could be string, number, or object)
  public?: boolean
}

// Define the possible types that can be wrapped in a TypedProperty.
type PropertyValueTypes = string | number | object

// Represents a map of custom properties where each key (propertyName) maps to a TypedProperty with a value of one of the allowed types.
type PropertyMap = {
  [propertyName: string]: TypedProperty<PropertyValueTypes>
}

// The shape of data accepted by Dynatrace's `sendSessionProperties` and `addActionProperties`.
// A paramKey maps to either a PropertyMap (a set of properties) or a number (used in action property for setting ActionId).
type CustomProperties = {
  [paramKey: string]: PropertyMap | number
}
// -----------------------------------------------------------------------------

// Local dtRum structure to model the required methods on the Dynatrace RUM API.
type DtrumAPI = {
  identifyUser: (id: string) => void
  endSession: () => void
  enterAction: (infoLogMessage: string) => number
  leaveAction: (actionId: number) => void
  reportError: (errorLogMessage: Error | string, actionId: number) => void
  sendSessionProperties: (properties: CustomProperties) => void
  addActionProperties: (
    actionId: number,
    javaLong?: PropertyMap | null,
    date?: PropertyMap | null,
    shortString?: PropertyMap | null,
    javaDouble?: PropertyMap | null
  ) => void
}

// ---------------------- Utility Functions ----------------------------

/**
 * Safely returns the Dynatrace RUM API instance from the global window object.
 */
const getDtrum = (): DtrumAPI | null => {
  if ('dtrum' in window) {
    return window.dtrum as DtrumAPI
  }
  console.info('Dynatrace RUM is not available on the window object.')
  return null
}

/**
 * Determines whether the provided value is an empty object.
 * @returns True if the object has no own properties.
 */
const isEmptyObject = (val: PropertyValueTypes) =>
  typeof val === 'object' && val && Object.keys(val).length === 0

/**
 * Determines whether the provided value is an empty or whitespace-only string.
 * @returns True if the value is a empty string consisting only of whitespace or is an empty string.
 */
const isEmptyString = (val: PropertyValueTypes) =>
  typeof val === 'string' && val && val.trim().length === 0

/**
 * Creates a Dynatrace-compatible custom property payload based on the value's type.
 * This is used to send either session or user action properties.
 */
const generateParams = <T extends string | number | object>(
  key: string,
  val: T
): CustomProperties => {
  const valType = typeof val
  if (!(valType === 'number' || valType === 'object' || valType === 'string')) {
    throw new Error(`Unsupported type: ${valType}`)
  }
  const dtDataTypeName = JS_DT_DATATYPE_MAP[valType]
  const propertyKeyMap: PropertyMap = {
    [key]: {
      value: val,
      public: true
    }
  }
  return { [dtDataTypeName]: propertyKeyMap }
}

// ---------------------- Dynatrace Logging Helper -----------------------------

/**
 * Utility wrapper for interacting with Dynatrace RUM APIs across the app.
 */
const DynatraceHelper = {
  /**
   * Logs a trace/info-level message as a user action in Dynatrace.
   * @param message The message to log (e.g., "button clicked", "fetch started").
   */
  trace: (message: string) => {
    const dtrum = getDtrum()
    if (!dtrum || isEmptyString(message)) return

    const actionId = dtrum.enterAction(message)
    if (!actionId) {
      console.error('Failed to enter action for logging Info:')
      return
    }
    dtrum.leaveAction(actionId)
  },

  /**
   * Logs an error in Dynatrace and links it to a user action.
   * @param errorDetails A string or Error object.
   * @param errorActionName A string (optional)
   */
  logError: (
    errorDetails: Error | string,
    errorActionName = 'Error Detected'
  ) => {
    const dtrum = getDtrum()
    if (!dtrum || isEmptyObject(errorDetails) || isEmptyString(errorDetails))
      return

    const actionId = dtrum.enterAction(errorActionName)
    if (!actionId) {
      console.error('Failed to create action for logging error')
      return
    }
    dtrum.reportError(errorDetails, actionId)
    dtrum.leaveAction(actionId)
  },

  /**
   * Sends a custom session-level property to Dynatrace.
   * These properties apply to the entire session and are overwritten if re-sent.
   *
   * Example: Use this to log static or slow-changing session-level details like:
   * - `appversion`: e.g., "2.4.1"
   * - `productname`: e.g., "Merchant Cash Advance"
   * - `isetb`: e.g., true (indicates if the user is an existing customer)
   *
   * @param key Property name (must match the one configured in Dynatrace).
   * @param val Value to associate (string, number, or date). For example: 50000, "1.1.1", "2024-11-11",
   */
  logSessionProperty: <T extends PropertyValueTypes>(key: string, val: T) => {
    const dtrum = getDtrum()
    if (
      !dtrum ||
      isEmptyString(key) ||
      isEmptyObject(val) ||
      isEmptyString(val)
    )
      return

    const normalizedKey = key.toLowerCase()
    const customPropertyParamMap = generateParams(normalizedKey, val)
    // Send the custom property
    dtrum.sendSessionProperties({ ...customPropertyParamMap })
  },

  /**
   * Sends a custom user action property to Dynatrace. Values that may change during a user journey can be pushed to the User Action Property.
   * All instances of these values pushed to the dynatrace will be preserved and visible in the User Action Property.
   *
   * Example: If you're tracking which filters a user applies on a product listing page,
   * you can define a `filterapplied` user action property and log each filter interaction as it happens.
   *
   *
   * @param key Property name (must match the one configured in Dynatrace).
   * @param val Value to associate (string, number, or date). For example: 5000, "KYC", "2024-11-11",
   */
  logActionProperty: <T extends PropertyValueTypes>(key: string, val: T) => {
    const dtrum = getDtrum()
    if (
      !dtrum ||
      isEmptyString(key) ||
      isEmptyObject(val) ||
      isEmptyString(val)
    )
      return

    const normalizedKey = key.toLowerCase()
    const customPropertyParamMap = generateParams(normalizedKey, val)
    const actionId = dtrum.enterAction(
      `Custom Action Property: ${normalizedKey} logged with value: ${val}`
    )
    const valType = typeof val
    if (!actionId) {
      console.error(
        'Failed to enter action for logging custom property:',
        normalizedKey
      )
      return
    }

    const prop = customPropertyParamMap[
      JS_DT_DATATYPE_MAP[valType as keyof typeof JS_DT_DATATYPE_MAP]
    ] as PropertyMap

    if (valType === 'number')
      dtrum.addActionProperties(actionId, null, null, null, prop)
    else if (valType === 'object')
      dtrum.addActionProperties(actionId, null, prop)
    else dtrum.addActionProperties(actionId, null, null, prop)

    dtrum.leaveAction(actionId)
  },

  /**
   * Starts a new session by identifying the user/session.
   * Ends any existing session before starting a new one.
   * @param sessionId A unique identifier (user ID, application ID, etc.)
   */
  setSession: (sessionId: string) => {
    const dtrum = getDtrum()
    if (!dtrum) return

    if (!sessionId) {
      console.error('session Id is undefined')
      return
    }

    dtrum.identifyUser?.(sessionId)

    const appVersion = process.env.npm_package_version
    if (appVersion)
      DynatraceHelper.logSessionProperty('app_version', appVersion)
  },

  /**
   * Immediately ends the current session in Dynatrace.
   */
  endSession: () => {
    getDtrum()?.endSession()
  }
}

export default DynatraceHelper
