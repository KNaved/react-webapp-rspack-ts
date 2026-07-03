import type { ComponentType } from 'react'
import { lazy, Suspense } from 'react'
import type { LoaderFunction, LoaderFunctionArgs } from 'react-router'
import { redirect } from 'react-router'

import { getIsLoggedInSelector } from '~/src/Redux/Auth/Selectors'

import APP_ROUTES from '~/src/Constants/APP_ROUTES'
import { AppStore } from '~/src/Configurations/AppStore'

export const lazyLoadPage = (
  importer: () => Promise<{ default: ComponentType }>,
  key: string,
  Fallback?: ComponentType
) => {
  const Page = lazy(importer)
  const lazyPage = Fallback ? (
    <Suspense fallback={<Fallback />} key={key}>
      <Page />
    </Suspense>
  ) : (
    <Page />
  )

  return lazyPage
}

export const validatePrivateRouteLoader =
  (importer?: () => Promise<{ loader: LoaderFunction }>) =>
  async (args: LoaderFunctionArgs) => {
    const state = AppStore.getState()
    const isLoggedIn = getIsLoggedInSelector(state)

    if (!isLoggedIn) {
      return redirect(APP_ROUTES.DEFAULT_UNAUTH_FALLBACK.pathname)
    }

    return lazyLoadLoader(importer)(args)
  }

export const validatePublicRouteLoader =
  (importer?: () => Promise<{ loader: LoaderFunction }>) =>
  async (args: LoaderFunctionArgs) => {
    const state = AppStore.getState()
    const isLoggedIn = getIsLoggedInSelector(state)

    if (isLoggedIn) {
      return redirect(APP_ROUTES.DEFAULT_AUTH_FALLBACK.pathname)
    }

    return lazyLoadLoader(importer)(args)
  }

export const lazyLoadLoader =
  (importer?: () => Promise<{ loader: LoaderFunction }>) =>
  async (args: LoaderFunctionArgs) => {
    if (importer) {
      const { loader } = await importer()
      return loader(args)
    }
  }
