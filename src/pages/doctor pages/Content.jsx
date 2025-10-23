import React, { useEffect, useState } from 'react';
import DoctorLayout from '/src/components/doctor components/DoctorLayout.jsx';
import Nocontent from '/src/assets/images/doctor images/Nocontent.jpg';
import PostPopup from '/src/pages/doctor pages/PostPopup.jsx';
import deleteIcon from '/src/assets/images/doctor images/deleteIcon.png';
import config from "../../config";
import { X, Heart, MessageCircle, Clock, Trash2, Eye, User } from 'lucide-react';

const API_URL = config.API_URL;

const Content = () => {
  const [isPostPopupOpen, setPostPopupOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/post`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data = await res.json();
        if (res.ok && data.posts) {
          setPosts(data.posts);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
      }
    };

    fetchPosts();
  }, []);

  const handlePostSubmit = (newPost) => {
    setPosts((prev) => [...prev, newPost]);
    setPostPopupOpen(false);
  };

  const handleDelete = async (postId) => {
    try {
      const res = await fetch(`${API_URL}/api/post/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
        setDeleteConfirm(null);
        setSelectedPost(null);
      } else {
        alert('Failed to delete post');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const CommentItem = ({ comment, isReply = false }) => (
    <div className={`${isReply ? 'ml-10 mt-3' : 'mb-4'}`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          {comment.user.profilePhoto ? (
            <img
              src={comment.user.profilePhoto}
              alt={comment.user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900 text-sm">
                {comment.user.name}
              </span>
              <span className="text-xs text-gray-500">
                • {comment.user.userType}
              </span>
              {comment.edited && (
                <span className="text-xs text-gray-400 italic">
                  (edited)
                </span>
              )}
            </div>
            <p className="text-gray-700 text-sm break-words">
              {comment.text}
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-2 px-2">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              {comment.timeAgo}
            </span>
          </div>

          {/* Render replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem key={reply._id} comment={reply} isReply={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <DoctorLayout>
      <div className="min-h-screen p-8 rounded-lg shadow-md bg-white">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Posts</h1>
              <p className="text-gray-600">Manage and share your medical insights</p>
            </div>
            <button
              onClick={() => setPostPopupOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              + Create Post
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="max-w-7xl mx-auto">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="bg-white rounded-3xl p-12 shadow-lg">
                <img src={Nocontent} alt="No content" className="w-32 h-32 mb-6 mx-auto opacity-50" />
                <p className="text-gray-500 text-xl text-center mb-2">No posts yet</p>
                <p className="text-gray-400 text-sm text-center">Create your first post to get started</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer border border-gray-100"
                >
                  {/* Post Image */}
                  {post.mediaUrl && (
                    <div 
                      className="w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden"
                      onClick={() => setSelectedPost(post)}
                    >
                      <img
                        src={post.mediaUrl}
                        alt="Post"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Eye className="w-4 h-4 text-gray-700" />
                      </div>
                    </div>
                  )}
                  
                  {/* Post Content */}
                  <div 
                    className="p-6 flex-1 flex flex-col"
                    onClick={() => setSelectedPost(post)}
                  >
                    {/* Post Text */}
                    <div className="flex-1 mb-4">
                      <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
                        {post.text}
                      </p>
                    </div>

                    {/* Stats and Actions */}
                    <div className="border-t border-gray-100 pt-4 mt-auto space-y-3">
                      {/* Post Stats */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <Heart className="w-3.5 h-3.5 text-red-500" />
                            <span className="font-medium">{post.likes.length}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
                            <span className="font-medium">{post.comments.length}</span>
                          </span>
                        </div>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{post.timeAgo}</span>
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPost(post);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors duration-200 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(post._id);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors duration-200 text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Full View Modal */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-3xl z-10">
                <h3 className="text-xl font-bold text-gray-900">Post Details</h3>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {selectedPost.mediaUrl && (
                  <div className="mb-6 rounded-2xl overflow-hidden">
                    <img
                      src={selectedPost.mediaUrl}
                      alt="Post"
                      className="w-full max-h-96 object-contain bg-gray-50"
                    />
                  </div>
                )}

                <div className="space-y-6">
                  {/* Post Text */}
                  {selectedPost.text && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Description</h4>
                      <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
                        {selectedPost.text}
                      </p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center space-x-6 py-4 border-y border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      <span className="text-gray-700 font-medium">{selectedPost.likes.length} Likes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="w-5 h-5 text-blue-500" />
                      <span className="text-gray-700 font-medium">{selectedPost.comments.length} Comments</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700 font-medium">{selectedPost.timeAgo}</span>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {selectedPost.comments && selectedPost.comments.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-blue-500" />
                        Comments ({selectedPost.comments.length})
                      </h4>
                      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {selectedPost.comments.map((comment) => (
                          <CommentItem key={comment._id} comment={comment} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Comments State */}
                  {(!selectedPost.comments || selectedPost.comments.length === 0) && (
                    <div className="py-8 text-center">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No comments yet</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setSelectedPost(null)}
                      className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200 font-medium"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setDeleteConfirm(selectedPost._id);
                      }}
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors duration-200 font-medium flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Post</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Post?</h3>
                <p className="text-gray-600 text-center mb-6">
                  Are you sure you want to delete this post? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors duration-200 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Post Popup */}
        {isPostPopupOpen && (
          <PostPopup onClose={() => setPostPopupOpen(false)} onSubmit={handlePostSubmit} />
        )}
      </div>
    </DoctorLayout>
  );
};

export default Content;