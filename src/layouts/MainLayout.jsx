// MainLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";

const MainLayout = () => {
    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;