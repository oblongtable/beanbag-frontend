import QuizManager from "@/components/ApiTester";
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
    <QuizManager></QuizManager>
  );
};

export default Profile;
