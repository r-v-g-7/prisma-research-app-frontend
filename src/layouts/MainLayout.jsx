import { Outlet } from "react-router-dom";

const MainLayout = () => {
    return (
        <div className="min-h-screen flex flex-col">

            <header className="h-14 border-b flex items-center px-6">
                <h1 className="text-lg font-semibold">
                    Prism
                </h1>
            </header>

            <main className="flex-1 p-6">
                <Outlet />
            </main>

        </div>
    );
};

export default MainLayout;
