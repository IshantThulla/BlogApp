import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const isValidEmail = (email) => {
    // Basic email validation using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPassword = (password) => {
    // Add your password validation rules here
    // For example, at least 8 characters, containing both letters and numbers
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  const register = async (ev) => {
    ev.preventDefault();

    // Validate email
    if (!isValidEmail(username)) {
      alert('Invalid email address');
      return;
    }

    // Validate password
    if (!isValidPassword(password)) {
      alert('Invalid password. It must contain at least 8 characters, including both letters and numbers.');
      return;
    }

    // Continue with registration logic
    const response = await fetch('http://localhost:4000/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 200) {
      alert('Registration successful');
      navigate('/login');
    } else {
      alert('Registration failed!');
    }
  };

  return (
    <form className="register" onSubmit={register}>
      <h1>Register</h1>
      <input
        type="text"
        placeholder="Email (username)"
        value={username}
        onChange={(ev) => setUsername(ev.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(ev) => setPassword(ev.target.value)}
      />

      <button type="submit">Register</button>
    </form>
  );
}
