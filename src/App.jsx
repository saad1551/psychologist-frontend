import { useState, useEffect, useRef } from 'react'
import './App.css'
import Avatar from './components/Avatar'
import ChatInterface from './components/ChatInterface'
import ChatMessages from './components/ChatMessages'
import { DID_API_USERNAME, DID_API_PASSWORD } from './config'

function App() {
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const speechSynthesis = useRef(window.speechSynthesis);
  const currentUtterance = useRef(null);
  const speechQueue = useRef([]);
  const femaleVoice = useRef(null);

  // Initialize voice selection
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.current.getVoices();
      console.log(voices)
      // Try to find a female voice, prioritizing English voices
      const preferredVoices = [
        'Samantha',
        'Karen',
        'Victoria',
        'Microsoft Zira Desktop',
        'Google UK English Female',
      ];
      
      // First try to find one of our preferred voices
      for (const voiceName of preferredVoices) {
        const voice = voices.find(v => v.name === voiceName);
        if (voice) {
          femaleVoice.current = voice;
          return;
        }
      }
      
      // If no preferred voice found, look for any female English voice
      const englishFemaleVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        voice.name.toLowerCase().includes('female')
      );
      
      if (englishFemaleVoice) {
        femaleVoice.current = englishFemaleVoice;
      }
    };

    // Chrome loads voices asynchronously
    if (speechSynthesis.current.getVoices().length === 0) {
      speechSynthesis.current.addEventListener('voiceschanged', loadVoices);
    } else {
      loadVoices();
    }

    return () => {
      speechSynthesis.current.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const stopSpeech = () => {
    if (speechSynthesis.current) {
      speechSynthesis.current.cancel();
      speechQueue.current = [];
      currentUtterance.current = null;
      setIsSpeaking(false);
    }
  };

  const speakMessage = (text) => {
    if (speechSynthesis.current) {
      // Cancel any ongoing speech
      if (currentUtterance.current) {
        speechSynthesis.current.cancel();
      }
      
      // Split text into sentences for better handling
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      
      // Clear any existing queue
      speechQueue.current = [];
      
      // Create utterances for all sentences
      sentences.forEach((sentence, index) => {
        const utterance = new SpeechSynthesisUtterance(sentence.trim());
        utterance.rate = 1.1;
        utterance.pitch = 1.4;
        utterance.volume = 1.0;
        
        // Set the female voice if available
        if (femaleVoice.current) {
          utterance.voice = femaleVoice.current;
        }
        
        // Add a small pause only after certain punctuation
        if (sentence.match(/[.!?]$/)) {
          utterance.onend = () => {
            if (index < sentences.length - 1) {
              setTimeout(() => {
                speechSynthesis.current.speak(speechQueue.current[index + 1]);
              }, 10);
            } else {
              setIsSpeaking(false);
              currentUtterance.current = null;
            }
          };
        } else {
          utterance.onend = () => {
            if (index < sentences.length - 1) {
              speechSynthesis.current.speak(speechQueue.current[index + 1]);
            } else {
              setIsSpeaking(false);
              currentUtterance.current = null;
            }
          };
        }
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setIsSpeaking(false);
        };
        
        speechQueue.current.push(utterance);
      });
      
      // Start speaking the first sentence
      currentUtterance.current = speechQueue.current[0];
      speechSynthesis.current.speak(speechQueue.current[0]);
      setIsSpeaking(true);
    }
  };

  const pollTalkStatus = async (talkId) => {
    const maxAttempts = 100;
    const interval = 2000;
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
      
      if (!data.talk_id) {
        // Speak the psychologist's message
        speakMessage(psychologistMessage.text);
      }
      
    } catch (error) {
      console.error('Error:', error);
      // Add a default response message in case of error
      const errorMessage = {
        type: 'psychologist',
        text: 'I apologize, but I\'m having trouble processing your message right now. Could you please try again?',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      speakMessage(errorMessage.text);
    }
  };

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (speechSynthesis.current) {
        speechSynthesis.current.cancel();
      }
    };
  }, []);

  return (
    <div className="app-container">
      <h1>Virtual Psychologist</h1>
      <div className="main-content">
        <div className={`video-section ${isSpeaking ? 'speaking' : ''}`}>
          <Avatar speaking={isSpeaking} videoUrl={videoUrl} />
          {isSpeaking && (
            <button 
              className="stop-speech-button"
              onClick={stopSpeech}
              title="Stop speaking"
            >
              <svg viewBox="0 0 24 24" width="24" height="24">
                <rect x="6" y="6" width="12" height="12" fill="currentColor"/>
              </svg>
            </button>
          )}
        </div>
        <div className="chat-section">
          <ChatMessages messages={messages} />
          <ChatInterface onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  )
}

export default App
