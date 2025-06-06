import { StrictMode } from 'react'
import MainPage from './pages/MainPage.tsx'
import { HashRouter, Route, Routes } from 'react-router'

import IndexLayout from './components/layouts/IndexLayout.tsx'
import CreateQuiz from './pages/CreateQuiz.tsx'
import LobbyPage from './pages/LobbyPage.tsx'
import Profile from './pages/Profile.tsx'
import ApiTester from './pages/TestApi.tsx'
import PlayScreen from './components/play-quiz/PlayScreen.tsx'

const App = () => {

  return (
    <StrictMode>
      <HashRouter>
        <Routes>
          <Route element={<IndexLayout />}>
            <Route path='/' element={<MainPage />} />
            <Route path='/create-quiz' element={<CreateQuiz />} />
            <Route path='/lobby/:lobbyId' element={<LobbyPage />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/test-api' element={<ApiTester />} />
            <Route path='/play-test' element={<PlayScreen questionText='How big is a dog?' answers={[{text: "Big", isCorrect: true}, {text: "Small", isCorrect: false}, {text: "Medium", isCorrect: false}, {text: "Large", isCorrect: false}]} timer={20}/>} />
          </Route>
        </Routes>
      </HashRouter>
    </StrictMode>
  );

}

export default App;
