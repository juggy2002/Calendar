import React, { useEffect, useState } from 'react';
import { logout, getMe, getUsers } from './api';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getMe().then(setUser).catch(() => navigate('/login'));
    getUsers().then(setUsers).catch(console.error);
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCreateUser = () => navigate('/login/admin/create-user');

  const handleEditUser = (id) => {
    navigate(`/login/admin/edit-user/${id}`);
  };

  return (
    <div style={styles.wrapper}>
      <aside style={styles.sidebar}>
        <h2>Admin</h2>
        <button style={styles.createButton} onClick={handleCreateUser}>
          <span style={styles.blueDot}></span> Create User
        </button>
        <button style={styles.logoutButton} onClick={handleLogout}>
          <span style={styles.redDot}></span> Logout
        </button>
      </aside>
      <main style={styles.main}>
        <h2>Current Users</h2>
        <input type="text" placeholder="Search Users" style={styles.search} />
        {users.map(u => (
          <div key={u.id} style={styles.userCard}>
            <span>{u.username}</span>
            <div>
              <button
                style={styles.editButton}
                onClick={() => handleEditUser(u.id)}
              >
                Edit
              </button>
              <span style={styles.rolePill}>{u.role}</span>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
  sidebar: {
    width: '220px',
    borderRight: '1px solid #eee',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  createButton: {
    background: '#f0f0f0',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    fontWeight: '500',
    marginTop: '1rem',
  },
  blueDot: {
    width: '10px',
    height: '10px',
    backgroundColor: '#3b82f6',
    borderRadius: '50%',
    display: 'inline-block',
  },
  redDot: {
    width: '10px',
    height: '10px',
    backgroundColor: '#ef4444',
    borderRadius: '50%',
    display: 'inline-block',
  },
  logoutButton: {
    background: 'transparent',
    border: 'none',
    color: '#333',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: 'auto',
  },
  main: {
    flexGrow: 1,
    padding: '2rem',
    overflowY: 'auto',
  },
  search: {
    padding: '0.75rem',
    width: '100%',
    maxWidth: '400px',
    margin: '1rem 0',
    borderRadius: '8px',
    border: '1px solid #ccc',
  },
  userCard: {
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '1rem',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: '1px solid #999',
    background: '#f5f5f5',
    cursor: 'pointer',
    marginRight: '0.5rem',
  },
  rolePill: {
    display: 'inline-block',
    background: '#111',
    color: '#fff',
    padding: '0.4rem 1rem',
    borderRadius: '8px',
    fontSize: '0.8rem',
  },
};

export default HomePage;
