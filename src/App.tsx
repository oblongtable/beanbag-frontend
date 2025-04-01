import { StrictMode } from 'react'
import HomePage from './pages/HomePage.tsx'
import { HashRouter, Route, Routes } from 'react-router'

import IndexLayout from './components/layouts/IndexLayout.tsx'
import CreateQuiz from './pages/CreateQuiz.tsx'
import Login from './pages/Login.tsx'


const App = () => {
  return (
    <StrictMode>
      <HashRouter>
        <Routes>
          <Route element={<IndexLayout />}>
            <Route path='/' element={<HomePage />} />
            <Route path='/create-quiz' element={<CreateQuiz />} />
            <Route path='/login' element={<Login />} />
          </Route>
        </Routes>
      </HashRouter>
    </StrictMode>
  );
  
}

export default App;




