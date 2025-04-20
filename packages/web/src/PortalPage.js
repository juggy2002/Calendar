import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

function PortalPage({ user }) {
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showPingUser, setShowPingUser] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const Modal = ({ children, onClose }) => (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.close}>×</button>
        {children}
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <h2>Welcome {user?.username || 'User'}</h2>
        <button onClick={() => setShowAddEvent(true)}>+ Add Event</button>
        <button onClick={() => setShowPingUser(true)}>📨 Ping User</button>
        <button onClick={() => setShowInbox(true)}>🔔 Inbox</button>
        <button onClick={() => setShowNotifications(true)}>📋 Notifications</button>
      </aside>
      <main style={styles.calendar}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
        />
      </main>

      {showAddEvent && (
        <Modal onClose={() => setShowAddEvent(false)}>
          <h3>Create Event</h3>
          <input placeholder="Event Title" style={styles.input} />
          <input type="date" style={styles.input} />
          <button style={styles.button}>Save</button>
        </Modal>
      )}

      {showPingUser && (
        <Modal onClose={() => setShowPingUser(false)}>
          <h3>Ping User</h3>
          <input placeholder="Username" style={styles.input} />
          <textarea placeholder="Message" style={styles.input} />
          <button style={styles.button}>Send</button>
        </Modal>
      )}

      {showInbox && (
        <Modal onClose={() => setShowInbox(false)}>
          <h3>Inbox</h3>
          <p>No new messages</p>
        </Modal>
      )}

      {showNotifications && (
        <Modal onClose={() => setShowNotifications(false)}>
          <h3>Notifications</h3>
          <p>No unread notifications</p>
          <button style={styles.button}>Mark all as read</button>
        </Modal>
      )}
    </div>
  );
}

const styles = {
  container: { display: 'flex', height: '100vh' },
  sidebar: { width: 200, padding: 20, background: '#eee', display: 'flex', flexDirection: 'column', gap: 10 },
  calendar: { flex: 1, padding: 20 },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modal: { background: '#fff', padding: 20, borderRadius: 8, position: 'relative', width: 400 },
  close: { position: 'absolute', top: 10, right: 10 },
  input: { display: 'block', margin: '10px 0', padding: 8, width: '100%' },
  button: { padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
};

export default PortalPage;