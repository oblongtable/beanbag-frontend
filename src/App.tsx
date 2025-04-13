import { StrictMode, useState } from 'react'
import HomePage from './pages/HomePage.tsx'
import { HashRouter, Route, Routes } from 'react-router'

import IndexLayout from './components/layouts/IndexLayout.tsx'
import CreateQuiz from './pages/CreateQuiz.tsx'
import LobbyPage from './pages/LobbyPage.tsx'
import Profile from './pages/Profile.tsx'
import ApiTester from './pages/TestApi.tsx'
import { WebSocketContext } from './context/WebSocketContext.tsx'

const App = () => {

  const [webSocket, setWebSocket] = useState< WebSocket | null>(null);

  return (
    <StrictMode>
      <WebSocketContext.Provider value={{webSocket, setWebSocket}}>
        <HashRouter>
          <Routes>
            <Route element={<IndexLayout />}>
              <Route path='/' element={<HomePage />} />
              <Route path='/create-quiz' element={<CreateQuiz />} />
              <Route path='/lobby/:lobbyId' element={<LobbyPage />} />
              <Route path='/profile' element={<Profile />} />
              <Route path='/test-api' element={<ApiTester />} />
            </Route>
          </Routes>
        </HashRouter>0
      </WebSocketContext.Provider>
    </StrictMode>
  );
  
}

export default App;
