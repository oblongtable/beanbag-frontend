import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { HashRouter, Route, Routes } from 'react-router'
import IndexLayout from './components/layouts/IndexLayout.tsx'
import CreateQuiz from './pages/CreateQuiz.tsx'
import Login from './pages/Login.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<IndexLayout />}>
          <Route path='/' element={<App />} />
          <Route path='/create-quiz' element={<CreateQuiz />} />
          <Route path='/login' element={<Login />} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>,
)
