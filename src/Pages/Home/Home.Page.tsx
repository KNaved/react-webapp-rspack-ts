import type { FC } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  DsImage,
  DsRemixIcon,
  DsStack,
  DsToggle,
  DsTypography
} from '@am92/react-design-system'

import { setThemeSchemeAction } from '~/src/Redux/Theme/Actions'
import { getThemeReducer } from '~/src/Redux/Theme/Selectors'

import HOME_IMAGE from '~/src/Assets/HOME_IMAGE'

const HomePage: FC = () => {
  const dispatch = useDispatch()
  const { scheme } = useSelector(getThemeReducer)

  console.log('scheme', scheme)

  const handleSchemeChange = (_name: string, value: boolean) => {
    const newScheme = value ? 'dark' : 'light'
    dispatch(setThemeSchemeAction(newScheme))
  }

  return (
    <DsStack
      justifyContent={'center'}
      alignItems={'center'}
      direction={'column'}
      height={'var(--100vh)'}
      sx={{
        px: 'var(--ds-spacing-warm)'
      }}
    >
      <DsImage
        srcSet={HOME_IMAGE}
        style={{ width: '100%', height: 'auto' }}
        WrapperProps={{ sx: { maxWidth: 335, maxHeight: 260 } }}
      />
      <DsTypography variant='displayBoldLarge'>Home Page</DsTypography>
      <DsStack
        alignItems={'center'}
        direction={'row'}
        sx={{
          gap: 'var(--ds-spacing-glacial)'
        }}
      >
        <DsToggle
          name='Dark Mode'
          value={scheme === 'dark'}
          onChange={handleSchemeChange}
        />
        <DsRemixIcon className='ri-contrast-2-line' />
      </DsStack>
    </DsStack>
  )
}

export default HomePage
