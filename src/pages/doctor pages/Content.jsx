import React, { useEffect, useState } from 'react';
import DoctorLayout from '/src/components/doctor components/DoctorLayout.jsx';
import Nocontent from '/src/assets/images/doctor images/Nocontent.jpg';
import PostPopup from '/src/pages/doctor pages/PostPopup.jsx';
import deleteIcon from '/src/assets/images/doctor images/deleteIcon.png';
import config from "../../config";

const API_URL = config.API_URL;

const Content = () => {
  const [isPostPopupOpen, setPostPopupOpen] = useState(false);
  const [posts, setPosts] = useState([]);

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
      } else {
        alert('Failed to delete post');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <DoctorLayout>
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Posts</h2>
          <button
            onClick={() => setPostPopupOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
          >
            Add Post
          </button>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center mt-20">
            <img src={Nocontent} alt="No content" className="w-24 h-24 mb-4" />
            <p className="text-gray-500 text-lg">No posts available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full"
              >
                {/* Post Image */}
                {post.mediaUrl && (
                  <div className="w-full h-48 bg-gray-100">
                    <img
                      src={post.mediaUrl}
                      alt="Post"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Post Content - Flexible area */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Post Text */}
                  <div className="flex-1 mb-4">
                    <p className="text-gray-700 text-sm leading-relaxed break-words">
                      {post.text}
                    </p>
                  </div>

                  {/* Fixed Bottom Area for Stats and Actions */}
                  <div className="border-t border-gray-100 pt-4 mt-auto">
                    {/* Post Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <span className="mr-1">❤️</span>
                          {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}
                        </span>
                        <span className="flex items-center">
                          <span className="mr-1">💬</span>
                          {post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}
                        </span>
                      </div>
                      <span className="flex items-center">
                        <span className="mr-1">🕒</span>
                        {post.timeAgo}
                      </span>
                    </div>

                    {/* Delete Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors duration-200"
                        title="Delete Post"
                      >
                        <img src={deleteIcon} alt="Delete" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isPostPopupOpen && (
          <PostPopup onClose={() => setPostPopupOpen(false)} onSubmit={handlePostSubmit} />
        )}
      </div>
    </DoctorLayout>
  );
};

export default Content;