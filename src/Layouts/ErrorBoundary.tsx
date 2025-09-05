import type { FC } from 'react'
import { useRouteError } from 'react-router'
// Error boundary component is necessary to over ride default react router error boundary
const ErrorBoundary: FC = () => {
  const error = useRouteError()

  // throw error so that generic AppErrorBoundary can catch it
  throw error
}

export default ErrorBoundary
