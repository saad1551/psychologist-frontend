import React, { useState, useRef, useEffect } from 'react';
import './Avatar.css';

const Avatar = ({ speaking, videoUrl = null }) => {
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef(null);
  const avatarImageUrl = 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg';

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.addEventListener('ended', () => {
        setShowVideo(false);
      });
    }
  }, [videoUrl]);

  const handleVideoClick = () => {
    if (videoUrl) {
      setShowVideo(true);
      if (videoRef.current) {
        videoRef.current.play();
      }
    }
  };

  return (
    <div className={`avatar-container ${speaking ? 'speaking' : ''}`}>
      <div className="avatar" onClick={handleVideoClick}>
        {showVideo && videoUrl ? (
          <video
            ref={videoRef}
            className="avatar-video"
            src={videoUrl}
            controls
            autoPlay
          />
        ) : (
          <img 
            src={avatarImageUrl} 
            alt="Avatar" 
            className="avatar-image"
          />
        )}
      </div>
    </div>
  );
};

export default Avatar; 