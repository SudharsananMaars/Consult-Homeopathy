import React, { useState } from 'react';
import config from "../../config";

const API_URL = config.API_URL;

const PostPopup = ({ onClose, onSubmit }) => {
  const [media, setMedia] = useState(null);
  const [description, setDescription] = useState('');
  const [shareToInstagram, setShareToInstagram] = useState(false);
  const [isPosting, setIsPosting] = useState(false); // ✅ Loading state
  const [error, setError] = useState(''); // ✅ Error message
  
  const MAX_DESCRIPTION_LENGTH = 50;
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];

  const handleMediaUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError(''); // Clear previous errors

    // ✅ Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 50MB');
      event.target.value = ''; // Reset input
      return;
    }

    // ✅ Validate file type
    const isValidImage = ALLOWED_IMAGE_TYPES.includes(file.type);

    if (!isValidImage && !isValidVideo) {
      setError('Invalid file type. Please upload an image (JPEG, PNG, GIF, WebP)');
      event.target.value = ''; // Reset input
      return;
    }

    setMedia(file);
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_DESCRIPTION_LENGTH) {
      setDescription(value);
    }
  };

  const handleSubmit = async () => {
    // ✅ Validation before submitting
    if (!media && !description.trim()) {
      setError('Please add a photo/video or description');
      return;
    }

    setIsPosting(true); // ✅ Start loading
    setError(''); // Clear errors

    const formData = new FormData();
    if (media) formData.append('file', media);
    formData.append('text', description);
    formData.append('shareToInstagram', shareToInstagram); 

    try {
      const res = await fetch(`${API_URL}/api/post`, {
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
        setError(data.message || 'Failed to create post');
      }
    } catch (err) {
      console.error('Error posting:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsPosting(false); // ✅ Stop loading
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
            disabled={isPosting}
          >
            &times;
          </button>
        </div>

        {/* ✅ Error message display */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-4">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaUpload}
            className="w-full"
            disabled={isPosting}
          />
          <p className="text-xs text-gray-500 mt-1">
            Max size: 50MB. Supported: Images (JPEG, PNG, GIF, WebP) 
          </p>
        </div>

        {getMediaPreview()}

        <div className="mb-4">
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Write a description..."
            className="w-full border border-gray-300 rounded-md p-2"
            rows="4"
            maxLength={MAX_DESCRIPTION_LENGTH}
            disabled={isPosting}
          />
          <div className="text-right text-sm mt-1">
            <span className={description.length >= MAX_DESCRIPTION_LENGTH ? 'text-red-500' : 'text-gray-500'}>
              {description.length} / {MAX_DESCRIPTION_LENGTH}
            </span>
          </div>
        </div>

        {/* ✅ Instagram checkbox */}
        <div className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="instagram"
            checked={shareToInstagram}
            onChange={() => setShareToInstagram(!shareToInstagram)}
            disabled={isPosting}
          />
          <label htmlFor="instagram" className="text-sm text-gray-700">
            Also post to Instagram
          </label>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isPosting}
            className={`py-2 px-4 rounded text-white ${
              isPosting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isPosting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Posting...
              </span>
            ) : (
              'Post'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostPopup;