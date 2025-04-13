import { useAuth0 } from "@auth0/auth0-react";

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Now TypeScript knows user is defined here
  return (
    <div>
      {user.picture && <img src={user.picture} alt={user.name ?? 'User avatar'} />}
      <h2>{user.name ?? 'No Name Provided'}</h2>
      <p>{user.email ?? 'No Email Provided'}</p>
    </div>
  );
};

export default Profile;
