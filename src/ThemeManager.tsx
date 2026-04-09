import type { FC } from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { SupportedColorScheme } from '@am92/react-design-system'
import { useColorScheme } from '@am92/react-design-system'

import { setThemeSchemeAction } from './Redux/Theme/Actions'
import { getThemeReducer } from '~/src/Redux/Theme/Selectors'

const validThemes: readonly SupportedColorScheme[] = [
  'light',
  'dark',
  'highContrast'
]
const isSupportedColorScheme = (
  value: unknown
): value is SupportedColorScheme =>
  typeof value === 'string' &&
  validThemes.includes(value as SupportedColorScheme)

const ThemeManager: FC = () => {
  const dispatch = useDispatch()
  const { scheme } = useSelector(getThemeReducer)
  const { colorScheme, setColorScheme } = useColorScheme()

  const handleStorage = ({ newValue }: StorageEvent) => {
    console.log('Storage event detected. New color scheme:', newValue)
    if (newValue && newValue !== scheme && isSupportedColorScheme(newValue)) {
      dispatch(setThemeSchemeAction(newValue))
    }
  }

  console.log('Current color scheme from useColorScheme:', colorScheme)
  console.log('Current color scheme from Redux store:', scheme)
  useEffect(() => {
    if (colorScheme !== scheme && setColorScheme) {
      setColorScheme(scheme)
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [scheme])

  return null
}

export default ThemeManager
