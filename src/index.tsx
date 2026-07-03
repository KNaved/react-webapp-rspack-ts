import React from 'react'
import { createRoot } from 'react-dom/client'

import { AppStoreProvider } from '~/src/Configurations/AppStore'

import App from '~/src/App'

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(
    <React.StrictMode>
      <AppStoreProvider AppComponent={App} />
    </React.StrictMode>
  )

  if (
    'serviceWorker' in navigator &&
    process.env.NODE_ENV === 'production' &&
    process.env.APP_PWA_ENABLE === 'true'
  ) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration)
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError)
        })
    })
  }
}
