import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const Feed = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6 flex flex-col gap-4">
            <h1 className="text-2xl font-semibold text-gray-800">
                Welcome to Feed, {user?.name}
            </h1>

            <Button
                onClick={logout}
                className="bg-red-500 text-white hover:bg-red-600 w-32 py-2"
            >
                Logout
            </Button>
        </div>
    );
};

export default Feed;
