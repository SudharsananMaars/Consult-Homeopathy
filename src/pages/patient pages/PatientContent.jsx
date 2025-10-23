import React, { useEffect, useState } from 'react';
import Layout from "/src/components/patient components/Layout.jsx";
import { Heart, HeartOff, MessageCircle, Share, Trash2, X } from 'lucide-react';
import config from "../../config";

const API_URL = config.API_URL;

const PatientContent = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");
  
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

  const openDeleteModal = (commentId) => {
    setCommentToDelete(commentId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCommentToDelete(null);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      const res = await fetch(`${API_URL}/api/post/${commentToDelete}/deleteComment`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        fetchPosts();
        closeDeleteModal();
      } else {
        console.error("Failed to delete comment");
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <Layout>
        {/* Header */}
          <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900">Channel Content</h1>
          </div>
        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-4 py-6">
          {loading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading posts...</p>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-gray-400 mb-4">
                <MessageCircle size={48} className="mx-auto" />
              </div>
              <p className="text-gray-500 text-lg">No posts found</p>
              <p className="text-gray-400 text-sm mt-1">Check back later for new content</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => {
                const isLiked = post.likes.includes('me');

                return (
                  <div key={post._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Post Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <img
                          src={post.author.profilePhoto}
                          alt="Doctor"
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{post.author.name}</p>
                          <p className="text-sm text-gray-500">{post.timeAgo}</p>
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div>
                      {/* Text Content */}
                      {post.text && (
                        <div className="px-4 py-3">
                          <p className="text-gray-800 leading-relaxed">{post.text}</p>
                        </div>
                      )}

                      {/* Media Content */}
                      {post.mediaType === "image" && (
                        <div className="relative bg-gray-100">
                          <img
                            src={post.mediaUrl}
                            alt="Post content"
                            className="w-full max-h-96 object-contain"
                          />
                        </div>
                      )}

                      {post.mediaType === "video" && (
                        <div className="relative bg-black">
                          <video 
                            controls 
                            className="w-full max-h-96"
                            preload="metadata"
                          >
                            <source src={post.mediaUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                    </div>

                    {/* Post Actions */}
                    <div className="px-4 py-3 border-t border-gray-100">
                      <div className="flex items-center space-x-6">
                        <button
                          onClick={() => handleLike(post._id)}
                          className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-colors ${
                            isLiked 
                              ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {isLiked ? 
                            <Heart size={18} className="fill-current" /> : 
                            <Heart size={18} />
                          }
                          <span className="text-sm font-medium">
                            {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}
                          </span>
                        </button>
                        
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MessageCircle size={18} />
                          <span className="text-sm font-medium">
                            {post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Comments Section */}
                    <div className="border-t border-gray-100">
                      {/* Existing Comments */}
                      {post.comments.length > 0 && (
                        <div className="px-4 py-3 space-y-3 max-h-60 overflow-y-auto">
                          {post.comments.map((comment) => (
                            <div key={comment._id} className="flex space-x-3">
                              <img
                                src={comment.user?.profilePhoto}
                                alt="User"
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="bg-gray-50 rounded-2xl px-3 py-2">
                                  <p className="text-sm font-semibold text-gray-900">{comment.user?.name}</p>
                                  <p className="text-sm text-gray-800">{comment.text}</p>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 ml-3">{comment.timeAgo}</p>
                              </div>
                              {currentUserId && comment.user?._id === currentUserId && (
                                <button
                                  onClick={() => openDeleteModal(comment._id)}
                                  className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors p-1"
                                  title="Delete comment"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment Input */}
                      <div className="px-4 py-3 border-t border-gray-50">
                        <div className="flex space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-blue-600">You</span>
                          </div>
                          <div className="flex-1 flex space-x-2">
                            <input
                              type="text"
                              value={commentInputs[post._id] || ''}
                              onChange={(e) =>
                                setCommentInputs((prev) => ({
                                  ...prev,
                                  [post._id]: e.target.value,
                                }))
                              }
                              placeholder="Write a comment..."
                              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleComment(post._id);
                                }
                              }}
                            />
                            <button
                              onClick={() => handleComment(post._id)}
                              disabled={!commentInputs[post._id]?.trim()}
                              className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Post
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Delete Comment</h3>
                <button
                  onClick={closeDeleteModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-4">
                <p className="text-gray-600">
                  Are you sure you want to delete this comment? This action cannot be undone.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteComment}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
     
    </Layout>
  );
};

export default PatientContent;