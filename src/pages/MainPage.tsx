import { useAuth0 } from '@auth0/auth0-react';
import WelcomePage from './WelcomePage';
import HomePage from './HomePage';
import { useUser } from '@/context/UserContext';

function MainPage() {   

    const { user, isAuthenticated, isLoading } = useAuth0();
      const { userName } = useUser();

    return (
        <div>
            {(isAuthenticated && user || userName) && <HomePage />}
            {isLoading && <p>Loading...</p>}
            {(!isAuthenticated && !userName) && <WelcomePage />}
        </div>
    );
}

export default MainPage;