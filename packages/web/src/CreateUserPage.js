import React, { useState, useEffect } from 'react';
import { createUser, getUser, updateUser } from './api';
import { useNavigate, useParams } from 'react-router-dom';

function CreateUserPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      getUser(id)
        .then(user => {
          setUsername(user.username);
          setRole(user.role);
        })
        .catch(() => setError('User not found'));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await updateUser(id, { username, password, role });
      } else {
        await createUser(username, password, role);
      }
      navigate('/login/admin');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2>{id ? 'Edit User' : 'Create User'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder={id ? 'Leave blank to keep password' : 'Password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.input}>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <button type="submit" style={styles.button}>{id ? 'Update' : 'Create'}</button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '400px',
    margin: '0 auto',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '1rem',
  },
  button: {
    padding: '0.75rem',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
};

export default CreateUserPage;
