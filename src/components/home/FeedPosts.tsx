import Post from '../profile/Post';

// Mock data for demonstration - matching the existing Post component structure
const mockPosts = [
    {
        id: 1,
        author: 'Bessie Cooper',
        role: 'Digital Marketer',
        time: '2 hours ago',
        content: "In today's fast-paced, digitally driven world, digital marketing is not just a strategy; it's a necessity for businesses of all sizes, at...",
        likes: 24,
        comments: 5,
        image: null,
    },
    {
        id: 2,
        author: 'Daniel Brown',
        role: 'Digital Marketer',
        time: '3 hours ago',
        content: 'Fantastic post! Your content always brings a smile to my face. Keep up the great work! 👍',
        likes: 18,
        comments: 3,
        image: null,
    },
    {
        id: 3,
        author: 'David Martinez',
        role: 'Back-end Developer',
        time: '5 hours ago',
        content: 'Your positivity is contagious! Thanks for brightening up my feed. Have a fantastic day!',
        likes: 32,
        comments: 8,
        image: null,
    },
    {
        id: 4,
        author: 'Jacob Jones',
        role: 'Sales Manager',
        time: '1 day ago',
        content: "Prepare to be dazzled by our latest collection! From trendy fashion to must-have gadgets, we've got something for everyone.",
        likes: 56,
        comments: 12,
        image: 'https://images.unsplash.com/photo-1593642532842-98d0fd5ebc1a?w=800&h=400&fit=crop',
    },
];

const FeedPosts = () => {
    return (
        <div className="flex flex-col gap-3">
            {mockPosts.map((post) => (
                <Post key={post.id} post={post} />
            ))}
        </div>
    );
};

export default FeedPosts;
