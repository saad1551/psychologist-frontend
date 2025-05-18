import React, { useState, useEffect } from 'react';
import './ChatInterface.css';

const ChatInterface = ({ onSendMessage }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (window.webkitSpeechRecognition) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript.trim()) {
          onSendMessage(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    } else {
      console.error('Speech recognition not supported in this browser');
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [onSendMessage]);

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <div className="chat-interface">
      <button 
        onClick={toggleListening}
        className={`mic-button ${isListening ? 'listening' : ''}`}
      >
        {isListening ? 'Listening...' : 'Click to Speak'}
        <div className="mic-icon">
          {isListening ? '🎤' : '🎙️'}
        </div>
      </button>
    </div>
  );
};

export default ChatInterface; 