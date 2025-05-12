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
import { Link, useNavigate } from "react-router"; // Note: Ensure this is the correct import for your router version
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
  const { webSocket } = useWebSocket()
  // Get userName and logoutGuest from context
  const { userName, logoutGuest } = useUser();
  const isLoggedIn = isAuthenticated && user;
  // Determine if the user is a guest (not Auth0 authenticated but has a username in context)
  const isGuest = !isAuthenticated && !!userName;
  // Determine if a username exists (either from Auth0 or guest context)
  const hasUserName = user?.name || userName;
  const [open, setOpen] = useState(false)
  const navigate = useNavigate();


  return (
    <header className="flex items-center justify-between px-4 py-2 bg-blue-500 text-white shadow-md"> {/* Adjusted padding/shadow */}
      {/* Left Side */}
      <div className="flex items-center space-x-4"> {/* Adjusted spacing */}
        <Link to={{ pathname: "/" }}>
          <img src={logo} alt="Oblong Table" className="h-10" />
        </Link>
        {hasUserName && webSocket === null && (
            <>
              <Dialog open={open} onOpenChange={setOpen}>
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
                  <CreateLobbyForm setOpen={setOpen} userName={userName || user?.name || "Host"}/>
                </DialogContent>
              </Dialog>
            </>
          )}
        {/* Optional Links (Consider moving to a dropdown if many) */}
        {isLoggedIn && (
          <div className="hidden md:flex items-center space-x-4"> {/* Hide on small screens, show on medium+ */}
            <Link
              to={{ pathname: "/create-quiz" }}
              className={cn(buttonVariants({ variant: "ghost" }), "hover:bg-blue-400 hover:text-white")} // Style as ghost button
            >
              Create quiz
            </Link>
            <Link
              to={{ pathname: "/test-api" }}
              className={cn(buttonVariants({ variant: "ghost" }), "hover:bg-blue-400 hover:text-white")} // Style as ghost button
            >
              Test API
            </Link>
          </div>
          )}
        </div>

      {/* Right Side */}
      <div className="flex items-center space-x-2"> {/* Group Profile and Auth buttons */}
        {/* Profile Button - Show if Auth0 logged in OR guest */}
        {(isLoggedIn || isGuest) && (
          <Button asChild variant="ghost" className="hover:bg-blue-400 hover:text-white">
            <Link to={{ pathname: "/profile" }}>
              Profile
            </Link>
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
              logoutGuest();
              navigate('/');
            }}>
            Log Out
          </Button>
        ) : (
          // No User: Show Auth0 Login Button
          <LoginButton className={cn(buttonVariants({ variant: "ghost" }), "hover:bg-blue-400 hover:text-white")} />
        )}
      </div>
    </header>
  );
}

export default Header;
