import React from 'react';
import './ChatMessages.css';

const ChatMessages = ({ messages }) => {
  return (
    <div className="chat-messages">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`message ${msg.type === 'user' ? 'user-message' : 'psychologist-message'}`}
        >
          <div className="message-content">
            {msg.text}
          </div>
          <div className="message-time">
            {new Date(msg.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatMessages; 