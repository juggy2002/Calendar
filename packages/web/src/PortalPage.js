import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function PortalPage({ user, onLogout }) {
  const [events, setEvents] = useState([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [showPingUser, setShowPingUser] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const Modal = ({ title, children, onClose }) => (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.close}>×</button>
        <h3 style={styles.modalTitle}>{title}</h3>
        {children}
      </div>
    </div>
  );

  const handleSaveEvent = () => {
    if (newTitle && newDate) {
      setEvents(prev => [...prev, { title: newTitle, date: newDate }]);
      setNewTitle('');
      setNewDate('');
      setShowAddEvent(false);
    }
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

      {showAddEvent && (
        <Modal title="Create Event" onClose={() => setShowAddEvent(false)}>
          <input
            placeholder="Event Title"
            style={styles.input}
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <input
            type="date"
            style={styles.input}
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
          />
          <button style={styles.saveButton} onClick={handleSaveEvent}>Save</button>
        </Modal>
      )}

      {showPingUser && (
        <Modal title="Ping User" onClose={() => setShowPingUser(false)}>
          <input placeholder="Username" style={styles.input} />
          <textarea placeholder="Message" style={styles.input} />
          <button style={styles.saveButton}>Send</button>
        </Modal>
      )}

      {showInbox && (
        <Modal title="Inbox" onClose={() => setShowInbox(false)}>
          <p>No new messages</p>
        </Modal>
      )}

      {showNotifications && (
        <Modal title="Notifications" onClose={() => setShowNotifications(false)}>
          <p>No unread notifications</p>
          <button style={styles.saveButton}>Mark all as read</button>
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
  header: { padding: 16, display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid #ddd' },
  iconButton: { fontSize: 24, background: 'none', border: 'none', cursor: 'pointer' },
  calendarWrapper: { flex: 1, padding: 20, background: '#fff' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { background: '#fff', padding: 20, borderRadius: 8, width: 400, position: 'relative' },
  close: { position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' },
  modalTitle: { margin: 0, marginBottom: 12, fontSize: 18, fontWeight: 'bold' },
  input: { width: '100%', padding: 8, marginBottom: 12, border: '1px solid #ccc', borderRadius: 4, fontSize: 16 },
  saveButton: { padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }
};
