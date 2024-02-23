import React, { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../UserContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [redirect, setRedirect] = useState(false);
  const { setUserInfo } = useContext(UserContext);

  async function login(ev) {
    ev.preventDefault();

    try {
      const response = await fetch('http://localhost:4000/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        const userInfo = await response.json();
        setUserInfo(userInfo);
        setRedirect(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please try again later.');
    }
  }

  if (redirect) {
    return <Navigate to={'/'} />;
  }

  return (
    <form className='login' onSubmit={login}>
      <h1>Login</h1>
      {error && <p className='error'>{error}</p>}
      <input
        type='text'
        placeholder='Username'
        value={username}
        onChange={(ev) => setUsername(ev.target.value)}
        required
      />
      <input
        type='password'
        placeholder='Password'
        value={password}
        onChange={(ev) => setPassword(ev.target.value)}
        required
      />
      <button type='submit'>Login</button>
    </form>
  );
}
