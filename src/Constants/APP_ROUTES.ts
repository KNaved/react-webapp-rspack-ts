import type { NavigateOptions } from 'react-router'

export type AppRouteItem = {
  pathname: string
  options?: NavigateOptions
}

const APP_ROUTES = {
  HOME: {
    pathname: '/'
  } as AppRouteItem,
  ABOUT: {
    pathname: '/about'
  } as AppRouteItem,

  ANY: {
    pathname: '*'
  } as AppRouteItem,

  SOMETHING_WENT_WRONG: {
    pathname: '/something-went-wrong'
  } as AppRouteItem,

  UNSUPPORTED_BROWSERS: {
    pathname: '/unsupported-browsers'
  } as AppRouteItem,

  DEFAULT_UNAUTH_FALLBACK: {
    pathname: '/'
  } as AppRouteItem,

  DEFAULT_AUTH_FALLBACK: {
    pathname: '/about'
  } as AppRouteItem
}

export default APP_ROUTES
