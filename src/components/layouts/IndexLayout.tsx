import { Outlet } from "react-router";
import Header from "../Header";

function IndexLayout() {

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-grow">
        <Outlet />
      </div>
    </div>
  );
}

export default IndexLayout;
