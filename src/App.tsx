import '~/src/App.scss'

import type { FC } from 'react'
import { useSelector } from 'react-redux'
import {
  DsCssBaseline,
  Experimental_CssVarsProvider as CssVarsProvider,
  getTheme
} from '@am92/react-design-system'

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

  return (
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
  )
}

export default App
