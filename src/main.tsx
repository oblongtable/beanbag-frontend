import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { HashRouter, Route, Routes } from 'react-router'
import IndexLayout from './components/layouts/IndexLayout.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<IndexLayout />}>
          <Route path='/' element={<App />} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>,
)
