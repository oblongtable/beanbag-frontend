import { useAuth0 } from '@auth0/auth0-react';
import WelcomePage from './WelcomePage';
import HomePage from './HomePage';

function MainPage() {   

    const { user, isAuthenticated, isLoading } = useAuth0();

    return (
        <div>
            {isAuthenticated && user && <HomePage />}
            {isLoading && <p>Loading...</p>}
            {!isAuthenticated && <WelcomePage />}
        </div>
    );
}

export default MainPage;