import React, { Component } from 'react'

import DynatraceHelper from '~/src/Helpers/Dynatrace.Helper'
import SomethingWentWrongPage from '~/src/Pages/SomethingWentWrong/SomethingWentWrong.Page'
import UnsupportedBrowsersPage from '~/src/Pages/UnsupportedBrowsers/UnsupportedBrowsers.Page'

export interface IAppErrorBoundaryProps {
  children: React.ReactElement
}

type TErrorComponentCode = 'SOMETHING_WENT_WRONG' | 'BROWSER_NOT_SUPPORTED'

export interface IAppErrorBoundaryState {
  errorComponentCode: TErrorComponentCode | undefined
}

const getErrorComponentCode = (): TErrorComponentCode => {
  const isSupported = window.supportedBrowsers.test(navigator.userAgent)
  const errorComponentCode =
    (isSupported && 'SOMETHING_WENT_WRONG') || 'BROWSER_NOT_SUPPORTED'
  return errorComponentCode
}

const ERR_COMPONENT_CODE_MAP: Record<TErrorComponentCode, React.ComponentType> =
  {
    BROWSER_NOT_SUPPORTED: UnsupportedBrowsersPage,
    SOMETHING_WENT_WRONG: SomethingWentWrongPage
  }

export default class AppErrorBoundary extends Component<
  IAppErrorBoundaryProps,
  IAppErrorBoundaryState
> {
  state: IAppErrorBoundaryState = {
    errorComponentCode: undefined
  }

  static getDerivedStateFromError(): IAppErrorBoundaryState {
    // Update state to show fallback UI when an error occurs
    return { errorComponentCode: getErrorComponentCode() }
  }

  componentDidCatch(error: Error) {
    console.error('Global Error caught:', error.message)
    DynatraceHelper.logError(error.message, 'Global Error Detected')
  }

  render() {
    const { errorComponentCode } = this.state
    if (!errorComponentCode) {
      return this.props.children
    }

    const ErrorComponent = ERR_COMPONENT_CODE_MAP[errorComponentCode]
    return <ErrorComponent />
  }
}
