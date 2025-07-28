import type { FC } from 'react'
import { useEffect } from 'react'
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router'

import Loader from '~/src/Components/Loader'

const ErrorBoundary: FC = () => {
  const error = useRouteError()
  const navigate = useNavigate()

  useEffect(() => {
    if (isRouteErrorResponse(error)) {
      navigate(error.data)
    }
  })

  return <Loader />
}

export default ErrorBoundary
