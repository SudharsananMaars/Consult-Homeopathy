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
        const res = await fetch('${API_URL}/api/posts', {
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
      <div className="min-h-screen p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Posts</h2>
          <button
            onClick={() => setPostPopupOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Post
          </button>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center mt-20">
            <img src={Nocontent} alt="No content" className="w-24 h-24 mb-4" />
            <p className="text-gray-500">No posts available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post._id}
                className="flex justify-between border border-gray-200 rounded p-4 bg-white shadow"
              >
                <div className="flex space-x-4">
                  {post.mediaUrl && (
                    <img
                      src={post.mediaUrl}
                      alt="Post"
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="text-gray-700 mb-1 break-words max-w-xs">{post.text}</p>
                    <div className="text-sm text-gray-500 space-x-4">
                      <span>❤️ {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}</span>
                      <span>💬 {post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}</span>
                      <span>🕒 {post.timeAgo}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(post._id)}
                  className="hover:opacity-75"
                  title="Delete"
                >
                  <img src={deleteIcon} alt="Delete" className="w-5 h-5" />
                </button>
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

