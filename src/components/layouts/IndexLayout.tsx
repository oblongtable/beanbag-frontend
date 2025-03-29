import { Outlet } from "react-router";
import logo from "../../assets/logo.png";

function IndexLayout() {
    return (
    <div>
        <div className="bg-blue-500 w-full p-2 fixed top-0 left-0 z-10">
            <div className="container mx-auto flex items-center justify-center">
             <img src={logo} alt="Logo" className="h-12" />
            </div>
        </div>
        <div className="mt-20">
            <Outlet/>
        </div>
    </div>
    )
}

export default IndexLayout