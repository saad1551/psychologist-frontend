import { useState, useEffect } from 'react';
import './Avatar.css';

function Avatar({ speaking, videoUrl }) {
  const [showVideo, setShowVideo] = useState(false);
  const avatarImageUrl = 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg';

  useEffect(() => {
    if (videoUrl) {
      setShowVideo(true);
    }
  }, [videoUrl]);

  return (
    <div className="avatar-container">
      <img
        src={avatarImageUrl}
        alt="Avatar"
        className={`avatar-image ${showVideo ? 'hidden' : ''}`}
      />
      {videoUrl && (
        <video
          className={`avatar-video ${showVideo ? 'visible' : ''}`}
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
        />
      )}
    </div>
  );
}

export default Avatar; 