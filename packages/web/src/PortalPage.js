import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  getEvents,
  createEvent,
  getMessages,
  sendMessage,
  markMessageRead,
  getUsers
} from './api';

export default function PortalPage({ user, onLogout }) {
  const [events, setEvents] = useState([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');

  const [showPingUser, setShowPingUser] = useState(false);
  const [pingToId, setPingToId] = useState('');
  const [pingContent, setPingContent] = useState('');
  const [usersList, setUsersList] = useState([]);

  const [showInbox, setShowInbox] = useState(false);
  const [messages, setMessages] = useState([]);

  const [showChatGPT, setShowChatGPT] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');

  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    getEvents().then(setEvents).catch(console.error);
    getMessages().then(setMessages).catch(console.error);
    getUsers().then(setUsersList).catch(console.error);
  }, []);

  const Modal = ({ title, children, onClose }) => (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.close}>×</button>
        <h3 style={styles.modalTitle}>{title}</h3>
        {children}
      </div>
    </div>
  );

  const handleSaveEvent = async () => {
    if (!newTitle || !newDate) return;
    try {
      const ev = await createEvent(newTitle, newDate);
      setEvents(prev => [...prev, ev]);
      setNewTitle('');
      setNewDate('');
      setShowAddEvent(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePing = async () => {
    if (!pingToId || !pingContent) return;
    try {
      await sendMessage(pingToId, pingContent);
      const updated = await getMessages();
      setMessages(updated);
      setShowPingUser(false);
      setPingToId(''); setPingContent('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markMessageRead(id);
      setMessages(msgs => msgs.map(m => m.id === id ? { ...m, read: 1 } : m));
    } catch (err) {
      console.error(err);
    }
  };

  const handleChatSubmit = async () => {
    try {
      const res = await fetch('https://calendar-genq.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ prompt: chatInput })
      });
      const data = await res.json();
      setChatResponse(data.message);
    } catch (err) {
      setChatResponse("Error getting response from GPT.");
    }
    setChatInput('');
  };
  

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.topSidebar}>
          <h2 style={styles.welcome}>Welcome {user?.username || 'User'}</h2>
          <button style={styles.actionButton} onClick={() => setShowAddEvent(true)}>
            <span style={styles.dotPink}></span> Add Event
          </button>
          <button style={styles.actionButton} onClick={() => setShowPingUser(true)}>
            <span style={styles.dotGreen}></span> Ping User
          </button>
        </div>
        <div style={styles.bottomSidebar}>
          <button style={styles.actionButton} onClick={() => setShowNotifications(true)}>
            <span style={styles.dotPink}></span> Notifications
          </button>
          <button style={{ ...styles.actionButton, color: '#e74c3c' }} onClick={onLogout}>
            <span style={styles.dotRed}></span> Logout
          </button>
        </div>
      </aside>

      <div style={styles.main}>
        <header style={styles.header}>
          <button onClick={() => setShowInbox(true)} style={styles.iconButton}>🔔</button>
          <button onClick={() => setShowChatGPT(true)} style={styles.iconButton}>🧠</button>
        </header>
        <div style={styles.calendarWrapper}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            height="100%"
            events={events}
          />
        </div>
      </div>

      {showChatGPT && (
        <Modal title="Ask ChatGPT" onClose={() => setShowChatGPT(false)}>
          <textarea
            placeholder="Ask a question..."
            style={styles.input}
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
          />
          <button onClick={handleChatSubmit} style={styles.saveButton}>Ask</button>
          {chatResponse && <p style={{ marginTop: 10 }}>{chatResponse}</p>}
        </Modal>
      )}
    </div>
  );
}

const styles = {
  container: { display: 'flex', height: '100vh', overflow: 'hidden' },
  sidebar: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 240, padding: 20, background: '#f7f7f7' },
  topSidebar: { display: 'flex', flexDirection: 'column', gap: 12 },
  bottomSidebar: { display: 'flex', flexDirection: 'column', gap: 12 },
  welcome: { margin: 0, fontSize: 20, fontWeight: 'bold' },
  actionButton: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', borderRadius: 4 },
  dotPink: { width: 10, height: 10, borderRadius: '50%', background: '#d6336c' },
  dotGreen: { width: 10, height: 10, borderRadius: '50%', background: '#2ecc71' },
  dotRed: { width: 10, height: 10, borderRadius: '50%', background: '#e74c3c' },
  main: { flex: 1, display: 'flex', flexDirection: 'column' },
  header: { padding: 16, display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid #ddd', gap: 10 },
  iconButton: { fontSize: 24, background: 'none', border: 'none', cursor: 'pointer' },
  calendarWrapper: { flex: 1, padding: 20, background: '#fff' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { background: '#fff', padding: 20, borderRadius: 8, width: 400, position: 'relative' },
  close: { position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' },
  modalTitle: { margin: 0, marginBottom: 12, fontSize: 18, fontWeight: 'bold' },
  input: { width: '100%', padding: 8, marginBottom: 12, border: '1px solid #ccc', borderRadius: 4, fontSize: 16 },
  saveButton: { padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }
};
