import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/userApi';
import { TextInput, Button, Alert } from '@mantine/core';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      await loginUser(username, password);
      window.dispatchEvent(new Event('authChanged')); // Trigger the auth change event
      navigate('/'); // Use the navigate function to redirect
    } catch (error) {
      console.error('Error during login:', error);
      setError('Invalid username or password');      
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: '1rem' }}>
      <h2>Login</h2>
      {error && <Alert color="red">{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <TextInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" fullWidth mt="md">
          Login
        </Button>
      </form>
    </div>
  );
}

export default LoginPage;
