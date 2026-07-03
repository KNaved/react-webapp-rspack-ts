import '~/src/App.scss'

import type { FC } from 'react'
import { useSelector } from 'react-redux'
import {
  DsCacheProvider,
  DsCssBaseline,
  Experimental_CssVarsProvider as CssVarsProvider,
  getTheme
} from '@am92/react-design-system'
import createCache from '@emotion/cache'

import AppErrorBoundary from './AppErrorBoundary'
import ThemeManager from './ThemeManager'

import { getThemeReducer } from './Redux/Theme/Selectors'

import { THEME_MODE_STORAGE_KEY } from '~/src/Constants/THEME'

import AppInitializer from '~/src/AppInitializer'

export interface IAppProps {
  persisted: boolean
}

const App: FC<IAppProps> = props => {
  const { persisted } = props

  const { fontFamily, palette } = useSelector(getThemeReducer)
  const AppTheme = getTheme(palette, fontFamily)
  const nonce = window.__nonce__

  const emotionCache = createCache({
    key: 'mui',
    nonce,
    // prepend: true, // ymmv
    speedy: false // <--- key setting
  })

  return (
    <DsCacheProvider value={emotionCache}>
      <CssVarsProvider theme={AppTheme} modeStorageKey={THEME_MODE_STORAGE_KEY}>
        <DsCssBaseline>
          <ThemeManager />
          {persisted && (
            <AppErrorBoundary>
              <AppInitializer />
            </AppErrorBoundary>
          )}
        </DsCssBaseline>
      </CssVarsProvider>
    </DsCacheProvider>
  )
}

export default App
