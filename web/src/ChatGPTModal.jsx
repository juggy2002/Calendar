import React, { useState } from 'react';
import './ChatModal.css';

export default function ChatGPTModal({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m ChatGPT. Ask me anything.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('https://calendar-genq.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await res.json();
      setMessages([...newMessages, data.reply]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages([...newMessages, { role: 'assistant', content: 'Something went wrong. 😢' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-overlay">
      <div className="chat-modal">
        <button className="chat-close" onClick={onClose}>×</button>
        <h3 className="chat-title">Ask ChatGPT</h3>

        <div className="chat-history">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              <strong>{msg.role === 'user' ? 'You' : 'GPT'}:</strong> {msg.content}
            </div>
          ))}
          {loading && <div className="chat-message assistant">Typing...</div>}
        </div>

        <div className="chat-input-box">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask a question..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
} 