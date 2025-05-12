import { useAuth0 } from "@auth0/auth0-react";

interface LogoutButtonProps {
  className?: string;
}


const LogoutButton = (props: LogoutButtonProps) => {
  const { logout } = useAuth0();

  const {className, ...rest} = props

  return (
    <button className={`${className}`}
onClick={() => logout({ logoutParams: { returnTo: '/' } })}
      {...rest}
    >
      Log Out
    </button>
  );
};

export default LogoutButton;
