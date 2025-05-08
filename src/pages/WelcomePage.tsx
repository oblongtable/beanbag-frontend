import { useState } from "react";
import beanbagImage from "../assets/beanbag.png";
import { Button } from "../components/ui/button";
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

function WelcomePage() {
  const [name, setName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handlePlayClick = () => {
    setIsDialogOpen(true);
  };

  const handleNameSubmit = () => {
    // Here you would typically do something with the name,
    // like saving it to state or sending it to a backend.
    console.log("User's name:", name);
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col items-center min-h-screen py-10">
      <img src={beanbagImage} className="w-64 mb-8" alt="Beanbag" />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="default" size="lg" onClick={handlePlayClick}>
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
                value={name}
                onChange={(e) => setName(e.target.value)}
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
