import { useUser } from "@/context/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Profile = () => {
  const { userName, profilePicture, email } = useUser();

  return (
    <div className="flex flex-col items-center pt-10 p-4"> {/* Adjusted classes for top alignment */}
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {profilePicture && (
            <img
              src={profilePicture}
              alt={userName ?? 'User avatar'}
              className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-gray-200"
            />
          )}
          <h2 className="text-xl font-semibold mb-1 text-gray-800">
            {userName ?? 'No Name Provided'}
          </h2>
          <p className="text-md text-gray-600">
            {email ?? 'No Email Provided'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
