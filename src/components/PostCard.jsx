import { Link } from "react-router-dom";

const PostCard = ({ post }) => {
    return (
        <div>
            <Link
                to={`/post/${post._id}`}
                className="block border rounded-lg p-4 flex flex-col gap-2 hover:bg-gray-50 transition"
            >
                <h2 className="text-lg font-semibold">
                    {post.title}
                </h2>

                <div className="text-sm text-muted-foreground flex gap-2">
                    <span>{post.author.name}</span>
                    <span>•</span>
                    <span>{post.type}</span>
                </div>

                <p className="text-sm text-gray-700">
                    {post.content.slice(0, 100)}...
                </p>
            </Link>
        </div>
    );
};

export default PostCard;
