import React, { useEffect, useState } from 'react';
import Layout from "/src/components/patient components/Layout.jsx";
import { Heart, HeartOff } from 'lucide-react';
import config from "../../config";


const API_URL = config.API_URL;

const PatientContent = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  const token = localStorage.getItem("token");

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/post/homePosts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      } else {
        console.error("Failed to load posts");
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`${API_URL}/api/post/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  likes: post.likes.includes('me')
                    ? post.likes.filter((id) => id !== 'me')
                    : [...post.likes, 'me'],
                }
              : post
          )
        );
      }
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleComment = async (postId) => {
    const commentText = commentInputs[postId]?.trim();
    if (!commentText) return;

    try {
      const res = await fetch(`${API_URL}/api/post/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: commentText }),
      });

      const data = await res.json();
      if (data.success) {
        setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
        fetchPosts();
      } else {
        console.error("Failed to add comment");
      }
    } catch (err) {
      console.error("Error commenting:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <Layout>
      <div className="min-h-screen flex flex-col p-7">
        <h2 className="text-2xl font-bold mb-4">Channel Content</h2>

        {loading ? (
          <p className="text-gray-500 italic">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-500 italic">No posts found.</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => {
              const isLiked = post.likes.includes('me');

              return (
                <div key={post._id} className="border rounded-lg p-4 shadow-sm bg-white">
                  {/* Author info */}
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={post.author.profilePhoto}
                      alt="Doctor"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">{post.author.name}</p>
                      <p className="text-xs text-gray-400">{post.timeAgo}</p>
                    </div>
                  </div>

                  {/* Text */}
                  {post.text && <p className="mb-2">{post.text}</p>}

                  {/* Media */}
                  {post.mediaType === "image" && (
                    <div className="w-full h-[400px] bg-black rounded-lg mb-2 flex justify-center items-center overflow-hidden">
                      <img
                        src={post.mediaUrl}
                        alt="Post"
                        className="h-full object-contain"
                      />
                    </div>
                  )}

                  {post.mediaType === "video" && (
                    <video controls className="w-full rounded-lg mb-2">
                      <source src={post.mediaUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}

                  {/* Like button */}
                  <div className="flex items-center gap-3 mt-2 text-gray-600 text-sm">
                    <button
                      onClick={() => handleLike(post._id)}
                      className="flex items-center gap-1 hover:text-red-500 transition"
                    >
                      {isLiked ? <HeartOff size={16} /> : <Heart size={16} />}
                      {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}
                    </button>
                  </div>

                  {/* Comments */}
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Comments:</p>
                    {post.comments.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">No comments yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {post.comments.map((comment) => (
                          <div key={comment._id} className="text-sm border-t pt-2">
                            <div className="flex items-center gap-2 mb-1">
                              <img
                                src={comment.user?.profilePhoto}
                                alt="User"
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <span className="font-medium">{comment.user?.name}</span>
                              <span className="text-xs text-gray-400">{comment.timeAgo}</span>
                            </div>
                            <p className="ml-8 text-gray-700">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comment input */}
                    <div className="flex items-center mt-3 gap-2">
                      <input
                        type="text"
                        value={commentInputs[post._id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [post._id]: e.target.value,
                          }))
                        }
                        placeholder="Add a comment..."
                        className="border rounded px-3 py-1 text-sm w-full"
                      />
                      <button
                        onClick={() => handleComment(post._id)}
                        className="bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PatientContent;
