import { useState } from 'react'
import './App.css'
import Avatar from './components/Avatar'
import ChatInterface from './components/ChatInterface'
import ChatMessages from './components/ChatMessages'
import { DID_API_USERNAME, DID_API_PASSWORD } from './config'

function App() {
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);

  const pollTalkStatus = async (talkId) => {
    const maxAttempts = 100; // Maximum number of polling attempts
    const interval = 2000; // Poll every 2 seconds
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const response = await fetch(`https://api.d-id.com/talks/${talkId}`, {
          headers: {
            'Authorization': `Basic ${btoa(`${DID_API_USERNAME}:${DID_API_PASSWORD}`)}`,
          },
        });
        
        const data = await response.json();
        
        if (data.status === 'done' && data.result_url) {
          setVideoUrl(data.result_url);
          return true;
        } else if (data.status === 'error') {
          console.error('Talk generation failed:', data);
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('Error polling talk status:', error);
        return true;
      }
    };

    const poll = async () => {
      const isComplete = await checkStatus();
      attempts++;

      if (!isComplete && attempts < maxAttempts) {
        setTimeout(poll, interval);
      } else if (attempts >= maxAttempts) {
        console.error('Max polling attempts reached');
      }
    };

    poll();
  };

  const handleSendMessage = async (text) => {
    // Add user message
    const userMessage = {
      type: 'user',
      text,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      // Send message to your server
      const response = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      
      if (data.talk_id) {
        // Start polling for the talk status
        pollTalkStatus(data.talk_id);
      }

      // Add psychologist response using the response_message from the server
      const psychologistMessage = {
        type: 'psychologist',
        text: data.response_message || 'I understand how you feel. Would you like to tell me more about that?',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, psychologistMessage]);
      
    } catch (error) {
      console.error('Error:', error);
      // Handle error appropriately
    }
  };

  return (
    <div className="app-container">
      <h1>Virtual Psychologist</h1>
      <div className="main-content">
        <Avatar speaking={isSpeaking} videoUrl={videoUrl} />
        <ChatMessages messages={messages} />
        <ChatInterface onSendMessage={handleSendMessage} />
      </div>
    </div>
  )
}

export default App
