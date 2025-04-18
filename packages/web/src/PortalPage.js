import React, { useState, useEffect } from 'react';
import { getMe, logout } from './api';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

function PortalPage() {
  const [user, setUser] = useState(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showPingUser, setShowPingUser] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => navigate('/login'));
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px',
        borderRight: '1px solid #eee',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        <div>
          <h2>Welcome {user?.username || '******'}</h2>
          <button onClick={() => setShowAddEvent(true)} style={styles.button}>
            <span style={styles.dot('magenta')}></span> Add event 🗓️
          </button>
          <button onClick={() => setShowPingUser(true)} style={styles.button}>
            <span style={styles.dot('limegreen')}></span> Ping user 💬
          </button>
        </div>
        <div>
          <button onClick={() => setShowNotifications(true)} style={styles.button}>
            <span style={styles.dot('magenta')}></span> Notifications 🔔
          </button>
          <button onClick={handleLogout} style={styles.logout}>
            <span style={styles.dot('red')}></span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flexGrow: 1, padding: '1rem', position: 'relative' }}>
        <div style={{ textAlign: 'right' }}>
          <button
            onClick={() => setShowInbox(true)}
            style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {hasUnreadMessages ? '🔔' : '🔕'}
          </button>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            height="80vh"
            events={[]} // placeholder
          />
        </div>
      </main>

      {/* Modals */}
      {showAddEvent && <Modal title="Add Event" onClose={() => setShowAddEvent(false)} />}
      {showPingUser && <Modal title="Ping User" onClose={() => setShowPingUser(false)} />}
      {showNotifications && <Modal title="Notifications" onClose={() => setShowNotifications(false)} />}
      {showInbox && <Modal title="Inbox" onClose={() => setShowInbox(false)} />}
    </div>
  );
}

function Modal({ title, onClose }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#fff',
        padding: '2rem',
        borderRadius: '10px',
        width: '400px',
        textAlign: 'center',
      }}>
        <h3>{title}</h3>
        <p>This is a placeholder modal.</p>
        <button onClick={onClose} style={{ marginTop: '1rem' }}>Close</button>
      </div>
    </div>
  );
}

const styles = {
  button: {
    background: '#f5f5f5',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '8px',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  dot: (color) => ({
    width: '10px',
    height: '10px',
    backgroundColor: color,
    borderRadius: '50%',
    display: 'inline-block',
  }),
  logout: {
    background: 'transparent',
    border: 'none',
    color: '#333',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '1rem',
  }
};

export default PortalPage;