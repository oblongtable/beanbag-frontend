import { useAuth0 } from "@auth0/auth0-react";

interface LoginButtonProps {
  className: string
}

const LoginButton = (props: LoginButtonProps) => {
  const { loginWithRedirect } = useAuth0();
  const {className, ...rest} = props

  return (
    <button
      className={`${className}`} 
      onClick={() => loginWithRedirect()}
      {...rest}
    >
      Log In
    </button>
);
};

export default LoginButton;