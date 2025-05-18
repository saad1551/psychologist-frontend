import { useState } from 'react'
import './App.css'
import Avatar from './components/Avatar'
import ChatInterface from './components/ChatInterface'
import ChatMessages from './components/ChatMessages'

function App() {
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSendMessage = (text) => {
    // Add user message
    const userMessage = {
      type: 'user',
      text,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);

    // Simulate psychologist response
    setTimeout(() => {
      setIsSpeaking(true);
      setTimeout(() => {
        const psychologistMessage = {
          type: 'psychologist',
          text: 'I understand how you feel. Would you like to tell me more about that?',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, psychologistMessage]);
        setIsSpeaking(false);
      }, 2000);
    }, 1000);
  };

  return (
    <div className="app-container">
      <h1>Virtual Psychologist</h1>
      <div className="main-content">
        <Avatar speaking={isSpeaking} />
        <ChatMessages messages={messages} />
        <ChatInterface onSendMessage={handleSendMessage} />
      </div>
    </div>
  )
}

export default App
