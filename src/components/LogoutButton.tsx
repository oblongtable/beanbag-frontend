import { useAuth0 } from "@auth0/auth0-react";

const LogoutButton = () => {
  const { user, logout } = useAuth0();


  return (
    <button 
      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
    >
      ${user?.name} Log Out
    </button>
  );
};

export default LogoutButton;