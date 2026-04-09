import '~/src/App.scss'

import type { FC } from 'react'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'

import AppErrorBoundary from './AppErrorBoundary'

import { THEME_MODE_STORAGE_KEY } from '~/src/Constants/THEME'

import AppInitializer from '~/src/AppInitializer'
import AppTheme from '~/src/AppTheme'

export interface IAppProps {
  persisted: boolean
}

const App: FC<IAppProps> = props => {
  const { persisted } = props

  const nonce = window.__nonce__

  const emotionCache = createCache({
    key: 'mui',
    nonce,
    // prepend: true, // ymmv
    speedy: false // <--- key setting
  })

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={AppTheme} modeStorageKey={THEME_MODE_STORAGE_KEY}>
        <CssBaseline>
          {persisted && (
            <AppErrorBoundary>
              <AppInitializer />
            </AppErrorBoundary>
          )}
        </CssBaseline>
      </ThemeProvider>
    </CacheProvider>
  )
}

export default App
