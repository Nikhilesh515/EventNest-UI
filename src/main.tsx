import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { AppProviders } from '@/app/providers/AppProviders'
import { router } from '@/app/router'
import { KoiLoader } from '@/components/states/KoiLoader'

import '@/styles/index.css'

const container = document.getElementById('root')

if (!container) {
  throw new Error('Root container #root was not found in index.html')
}

createRoot(container).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider
        router={router}
        fallbackElement={<KoiLoader label="Loading EventNest…" size="lg" />}
      />
    </AppProviders>
  </StrictMode>,
)
