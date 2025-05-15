import logo from "@/assets/logo.png";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router"; // Note: Ensure this is the correct import for your router version
import LoginButton from "./auth/LoginButton";
import LogoutButton from "./auth/LogoutButton";
import { useState } from "react";
import { Button, buttonVariants } from "./ui/button"; // Import buttonVariants
import CreateLobbyForm from "./lobby/CreateLobbyForm";
import { useUser } from "@/context/UserContext";
import { useWebSocket } from "@/context/WebSocketContext";
import { cn } from "@/lib/utils"; // Import cn utility for combining class names

function Header() {
  const { user, isAuthenticated } = useAuth0();
  const { webSocket, disconnect } = useWebSocket()
  // Get userName and logoutGuest from context
  const { userName, logoutGuest } = useUser();
  const isLoggedIn = isAuthenticated && user;
  // Determine if the user is a guest (not Auth0 authenticated but has a username in context)
  const isGuest = !isAuthenticated && !!userName;
  // Determine if a username exists (either from Auth0 or guest context)
  const hasUserName = user?.name || userName;
  const [isCreateLobbyDialogOpen, setIsCreateLobbyDialogOpen] = useState(false);
  const [showLeaveLobbyDialog, setShowLeaveLobbyDialog] = useState(false);
  const [nextRoute, setNextRoute] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLeaveLobby = () => {
    if (webSocket) {
      // Close websocket connection
      disconnect();
    }
    // Navigate to the next route after leaving the lobby
    if (nextRoute) {
      navigate(nextRoute);
    }
    // Reset state
    setShowLeaveLobbyDialog(false);
    setNextRoute(null);
  };

  const handleHeaderButtonClick = (route: string) => {
    if (webSocket) {
      setNextRoute(route);
      setShowLeaveLobbyDialog(true);
    } else {
      navigate(route);
    }
  };


  return (
    <header className="flex items-center justify-between px-4 py-2 bg-blue-500 text-white shadow-md"> {/* Adjusted padding/shadow */}
      {/* Left Side */}
      <div className="flex items-center space-x-4"> {/* Adjusted spacing */}
        <Button variant="ghost" className="hover:bg-blue-400 hover:text-white" onClick={() => handleHeaderButtonClick("/")}>
          <img src={logo} alt="Oblong Table" className="h-10" />
        </Button>
        {hasUserName && webSocket === null && (
            <>
              <Dialog open={isCreateLobbyDialogOpen} onOpenChange={setIsCreateLobbyDialogOpen}>
                <DialogTrigger asChild>
                  {/* Use buttonVariants for consistent styling */}
                  <Button variant="ghost" className="hover:bg-blue-400 hover:text-white">Create Lobby</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create Lobby</DialogTitle>
                    <DialogDescription>Create a lobby to play with your friends</DialogDescription>
                  </DialogHeader>
                  {/* Pass user name if available, otherwise maybe a default or handle in form */}
                  <CreateLobbyForm setOpen={setIsCreateLobbyDialogOpen} userName={userName || user?.name || "Host"}/>
                </DialogContent>
              </Dialog>
            </>
          )}
        {/* Optional Links (Consider moving to a dropdown if many) */}
        {isLoggedIn && (
          <div className="hidden md:flex items-center space-x-4"> {/* Hide on small screens, show on medium+ */}
            <Button
              variant="ghost"
              className="hover:bg-blue-400 hover:text-white" // Style as ghost button
              onClick={() => handleHeaderButtonClick("/create-quiz")}
            >
              Create quiz
            </Button>
            <Button
              variant="ghost"
              className="hover:bg-blue-400 hover:text-white" // Style as ghost button
              onClick={() => handleHeaderButtonClick("/test-api")}
            >
              Test API
            </Button>
          </div>
          )}
        </div>

      {/* Right Side */}
      <div className="flex items-center space-x-2"> {/* Group Profile and Auth buttons */}
        {/* Profile Button - Show if Auth0 logged in OR guest */}
        {(isLoggedIn || isGuest) && (
          <Button variant="ghost" className="hover:bg-blue-400 hover:text-white" onClick={() => handleHeaderButtonClick("/profile")}>
            Profile
          </Button>
        )}

        {/* Auth Buttons Logic */}
        {isLoggedIn ? (
          // Auth0 User: Show Auth0 Logout Button
          <LogoutButton className={cn(buttonVariants({ variant: "ghost" }), "hover:bg-blue-400 hover:text-white")} />
        ) : isGuest ? (
          // Guest User: Show Guest Logout Button
          <Button
            variant="ghost"
            className="hover:bg-blue-400 hover:text-white"
            onClick={() => {
              if (webSocket) {
                setNextRoute('/');
                setShowLeaveLobbyDialog(true);
              } else {
                logoutGuest();
                navigate('/');
              }
            }}>
            Log Out
          </Button>
        ) : (
          // No User: Show Auth0 Login Button
          <LoginButton className={cn(buttonVariants({ variant: "ghost" }), "hover:bg-blue-400 hover:text-white")} />
        )}
      </div>

      {/* Leave Lobby Confirmation Dialog */}
      <Dialog open={showLeaveLobbyDialog} onOpenChange={setShowLeaveLobbyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Lobby?</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave the current lobby?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowLeaveLobbyDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLeaveLobby}>
              Leave
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}

export default Header;
