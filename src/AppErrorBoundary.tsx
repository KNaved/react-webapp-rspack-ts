import React, { Component } from 'react'

import DynatraceHelper from './Helpers/Dynatrace.Helper'

// @ts-expect-error since it is js file
import supportedBrowsers from '~/public/static/js/supportedBrowsers.js'
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
  const isSupported = supportedBrowsers.test(navigator.userAgent)
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

  // TODO: Move this to a global error handler
  componentDidMount() {
    // Set up global error listener
    window.addEventListener('error', this.handleGlobalError)
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handleGlobalError)
  }

  componentWillUnmount() {
    // Cleanup error listeners
    window.removeEventListener('error', this.handleGlobalError)
    window.removeEventListener('unhandledrejection', this.handleGlobalError)
  }

  handleGlobalError = (error: ErrorEvent | PromiseRejectionEvent) => {
    const message =
      typeof error === 'object' && 'reason' in error
        ? error.reason
        : error.message

    console.error('Global Error caught:', message)
    DynatraceHelper.logError(message, 'Global Error Detected')
    const errorComponentCode = getErrorComponentCode()
    this.setState({ errorComponentCode })
    return true
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
