import { Link } from "react-router";
import logo from "@/assets/logo.png";
import LogoutButton from "./LogoutButton";
import LoginButton from "./LoginButton";
import { useAuth0 } from "@auth0/auth0-react";

function Header() {
  const { user, isAuthenticated } = useAuth0();
  const isLoggedIn = isAuthenticated && user;

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-blue-500">
      <div className="flex items-center space-x-8">
        <Link to={{ pathname: "/" }}>
          <img src={logo} alt="Oblong Table" className="h-10" />
        </Link>
        <Link
          to={{
            pathname: "/create-quiz",
          }}
        >
          Create quiz
        </Link>
      </div>

      <div>
        <div>
          {isLoggedIn ? (
            <LogoutButton className="block" />
          ) : (
            <LoginButton className="block" />
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
