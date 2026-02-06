import { useParams } from 'react-router-dom'

const PostDetail = () => {
    const { postId } = useParams();
    console.log(postId);

    return (
        <div className="max-w-3xl mx-auto p-6 flex flex-col gap-4">

            <h1 className="text-2xl font-semibold">
                Post Title Here
            </h1>

            <div className="text-sm text-gray-500 flex gap-2">
                <span>Author Name</span>
                <span>•</span>
                <span>Post Type</span>
            </div>

            <div className="border rounded-lg p-4 text-sm leading-relaxed">
                Full post content will appear here. This is where the complete
                description or body of the post will be displayed.
            </div>

        </div>
    )
}

export default PostDetail;