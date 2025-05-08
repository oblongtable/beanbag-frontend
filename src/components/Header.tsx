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
import { Link } from "react-router";
import LoginButton from "./auth/LoginButton";
import LogoutButton from "./auth/LogoutButton";
import { useState } from "react";
import { Button } from "./ui/button";
import CreateLobbyForm from "./lobby/CreateLobbyForm";

function Header() {
  const { user, isAuthenticated } = useAuth0();
  const isLoggedIn = isAuthenticated && user;
  const [open, setOpen] = useState(false)


  return (
    <header className="flex items-center justify-between px-4 py-3 bg-blue-500">
      <div className="flex items-center space-x-8">
        {isLoggedIn && (
          <>
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
            <Link
              to={{
                pathname: "/test-api",
              }}
            >
              Test API
            </Link>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Create Lobby</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Lobby</DialogTitle>
                  <DialogDescription>Create a lobby to play with your friends</DialogDescription>
                </DialogHeader>
                <CreateLobbyForm setOpen={setOpen} userName={"host"}/>
              </DialogContent>
            </Dialog>
          </>
          )}
        </div>
      <div>
        <Link to={{ pathname: "/profile" }}>
          Profile
        </Link>
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
