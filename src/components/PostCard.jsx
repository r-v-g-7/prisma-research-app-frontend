const PostCard = ({ post }) => {

    return (
        <div className="border rounded-lg p-4 flex flex-col gap-2">

            <h2 className="text-lg font-semibold">
                {post.title}
            </h2>

            <div className="text-sm text-muted-foreground flex gap-2">
                <span>{post.author.name}</span>
                <span>•</span>
                <span>{post.type}</span>
            </div>

            <p className="text-sm">
                {post.content}
            </p>

        </div>
    );
};

export default PostCard;

