import { Link, Outlet } from "react-router";
import logo from "../../assets/logo.png";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "../LoginButton";
import LogoutButton from "../LogoutButton";

function IndexLayout() {

  const { user, isAuthenticated } = useAuth0();
  const isLoggedIn = isAuthenticated && user;

  return (
    <div>
      <div className="bg-blue-500 w-full p-2 fixed top-0 left-0 z-10">
        <div className="w-full flex">
          <div className="flex flex-1 items-center gap-8">
            <Link to={{pathname: "/"}}><img src={logo} alt="Logo" className="h-10" /></Link>
            <Link to={{
              pathname: "/create-quiz",
            }}>Create quiz</Link>
              
          </div>
            {/*TODO: Can login and it shows on dashboard but its broken af atm */}
            <div className="flex items-center pr-15">
              {isLoggedIn
                ? <LogoutButton />
                : <LoginButton />
              }
            </div>

        </div>
      </div>
      <div className="mt-20">
        <Outlet />
      </div>
    </div>
  );
}

export default IndexLayout;
