import React from 'react';
import './Avatar.css';

const Avatar = ({ speaking }) => {
  return (
    <div className={`avatar-container ${speaking ? 'speaking' : ''}`}>
      <div className="avatar">
        {/* Placeholder for avatar image - we'll use a simple representation for now */}
        <div className="avatar-head">
          <div className="avatar-face">
            <div className="eyes">
              <div className="eye"></div>
              <div className="eye"></div>
            </div>
            <div className="mouth"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Avatar; 