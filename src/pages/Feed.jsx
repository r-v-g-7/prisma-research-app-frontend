import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Feed = () => {
    const { user } = useContext(AuthContext)
    console.log(user);
    return <h1>Welcome to Feed, {user?.name}</h1>;
};

export default Feed;
