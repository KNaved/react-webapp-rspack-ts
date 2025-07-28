import type { FC } from 'react'
import { Suspense, useId } from 'react'
import { RouterProvider } from 'react-router/dom'

import Loader from '~/src/Components/Loader'

import getAppRouter from '~/src/Configurations/getAppRouter'

let router: ReturnType<typeof getAppRouter> | undefined
let key: string | undefined

const AppRouter: FC = () => {
  if (!router) {
    router = getAppRouter()

    if (!key) {
      key = useId()
    }
  }

  return (
    <Suspense fallback={<Loader />}>
      <RouterProvider router={router} key={key} />
    </Suspense>
  )
}
export default AppRouter
