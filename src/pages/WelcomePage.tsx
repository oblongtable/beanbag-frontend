import { useState } from "react";
import beanbagImage from "../assets/beanbag.png";
import { Button } from "../components/ui/button";
import { useUser } from "../context/UserContext"; // Import useUser
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import LoginButton from "../components/auth/LoginButton"; // Added import
import avatarPlaceholder from "../assets/avatar_placeholder.png"

function WelcomePage() {
  const [inputName, setInputName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { setUserName, setProfilePicture, setEmail } = useUser();

  const handlePlayClick = () => {
    setIsDialogOpen(true);
  };

  const handleNameSubmit = () => {
    if (inputName.trim()) {
      setUserName(inputName.trim());
      setProfilePicture(avatarPlaceholder);
      setEmail("Guest");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen py-10">
      <img src={beanbagImage} className="w-64 mb-8" alt="Beanbag" />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="default" size="lg" onClick={handlePlayClick} className="text-white rounded text-3xl px-20 py-7">
            Play
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enter Your Name</DialogTitle>
            <DialogDescription>
              Please enter your name to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="col-span-3"
                placeholder="Your awesome name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleNameSubmit}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <LoginButton className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700" /> {/* Added LoginButton */}
    </div>
  );
}

export default WelcomePage;
