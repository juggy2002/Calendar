// packages/web/src/HomePage.jsx

import React, { useEffect, useState } from 'react';
import { getUsers, logout } from './api';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Load users once on mount
  useEffect(() => {
    getUsers()
      .then(data => setUsers(data))
      .catch(err => console.error(err));
  }, []);

  // Handlers
  const handleCreate = () => {
    navigate('/admin/create-user');
  };

  const handleEdit = (id) => {
    navigate(`/admin/edit-user/${id}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  // Filtered list
  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 200,
        background: '#f7f7f7',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <h2>Admin</h2>
          <button
            onClick={handleCreate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              marginTop: 20,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 16
            }}
          >
            <span style={{
              width: 10, height: 10, borderRadius: '50%', background: '#2ecc71', display: 'inline-block'
            }} />
            Create User
          </button>
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#e74c3c',
            fontSize: 16
          }}
        >
          <span style={{
            width: 10, height: 10, borderRadius: '50%', background: '#e74c3c', display: 'inline-block'
          }} />
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
        <h1>Current Users</h1>
        <input
          type="text"
          placeholder="Search Users"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: 8,
            marginBottom: 20,
            borderRadius: 4,
            border: '1px solid #ccc'
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(user => (
            <div
              key={user.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                border: '1px solid #eee',
                borderRadius: 4
              }}
            >
              <span>{user.username}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleEdit(user.id)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #333',
                    background: 'none',
                    cursor: 'pointer',
                    borderRadius: 4
                  }}
                >
                  Edit
                </button>
                <span style={{
                  padding: '6px 12px',
                  background: '#333',
                  color: '#fff',
                  borderRadius: 4
                }}>
                  {user.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
