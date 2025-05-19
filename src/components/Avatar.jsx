import { useEffect, useRef } from 'react'
import './Avatar.css'

function Avatar({ speaking, videoUrl, onStopVideo }) {
  const videoRef = useRef(null);
  const avatarImageUrl = 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg';

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.src = videoUrl;
      videoRef.current.play().catch(error => {
        console.error('Error playing video:', error);
      });
    }
  }, [videoUrl]);

  const stopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.src = '';
    }
    onStopVideo();
  };

  return (
    <div className="avatar-container">
      {!videoUrl ? (
        <img 
          src={avatarImageUrl} 
          alt="Virtual Psychologist" 
          className={`avatar-image ${speaking ? 'speaking' : ''}`}
        />
      ) : (
        <div className="video-wrapper">
          <video
            ref={videoRef}
            className="avatar-video"
            playsInline
            autoPlay
            loop={false}
            controls={false}
          />
          <button 
            className="stop-video-button"
            onClick={stopVideo}
            title="Stop video"
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <rect x="6" y="6" width="12" height="12" fill="currentColor"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default Avatar 