import { StrictMode } from 'react'
import HomePage from './pages/HomePage.tsx'
import { HashRouter, Route, Routes } from 'react-router'

import IndexLayout from './components/layouts/IndexLayout.tsx'
import CreateQuiz from './pages/CreateQuiz.tsx'
import Login from './pages/Login.tsx'
import LobbyPage from './pages/LobbyPage.tsx'
import Profile from './pages/Profile.tsx'
import ManageQuizzes from './pages/TestQuizApi.tsx'



const App = () => {
  return (
    <StrictMode>
      <HashRouter>
        <Routes>
          <Route element={<IndexLayout />}>
            <Route path='/' element={<HomePage />} />
            <Route path='/create-quiz' element={<CreateQuiz />} />
            <Route path='/login' element={<Login />} />
            <Route path='/lobby/1234' element={<LobbyPage />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/manage-quiz' element={<ManageQuizzes />} />
          </Route>
        </Routes>
      </HashRouter>
    </StrictMode>
  );
  
}

export default App;
