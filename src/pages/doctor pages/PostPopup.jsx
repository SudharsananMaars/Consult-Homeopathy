import React, { useState } from 'react';

const PostPopup = ({ onClose, onSubmit }) => {
  const [media, setMedia] = useState(null);
  const [description, setDescription] = useState('');
  const [shareToInstagram, setShareToInstagram] = useState(false); // ✅ Renamed

  const handleMediaUpload = (event) => {
    setMedia(event.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!media && !description.trim()) return;

    const formData = new FormData();
    if (media) formData.append('file', media);
    formData.append('text', description);
    formData.append('shareToInstagram', shareToInstagram); // ✅ Correct field name

    try {
      const res = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.post) {
        onSubmit(data.post);
        onClose();
      } else {
        alert('Failed to create post');
      }
    } catch (err) {
      console.error('Error posting:', err);
    }
  };

  const getMediaPreview = () => {
    if (!media) return null;
    const url = URL.createObjectURL(media);

    if (media.type.startsWith('video')) {
      return (
        <video controls className="w-full max-h-96 rounded mb-4">
          <source src={url} type={media.type} />
          Your browser does not support the video tag.
        </video>
      );
    }

    return (
      <img
        src={url}
        alt="Uploaded"
        className="w-full max-h-96 object-contain rounded mb-4"
      />
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create Post</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-red-500"
          >
            &times;
          </button>
        </div>

        <div className="mb-4">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaUpload}
            className="w-full"
          />
        </div>

        {getMediaPreview()}

        <div className="mb-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a description..."
            className="w-full border border-gray-300 rounded-md p-2"
            rows="4"
          />
        </div>

        {/* ✅ Instagram checkbox */}
        <div className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="instagram"
            checked={shareToInstagram}
            onChange={() => setShareToInstagram(!shareToInstagram)}
          />
          <label htmlFor="instagram" className="text-sm text-gray-700">
            Also post to Instagram
          </label>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostPopup;



