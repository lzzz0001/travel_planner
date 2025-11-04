import React, { useState, useEffect } from 'react';
import supabaseClient from '../utils/supabaseClient';

const Auth = ({ onAuthChange }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already authenticated
    const currentUser = supabaseClient.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      if (onAuthChange) onAuthChange(currentUser);
    }
  }, [onAuthChange]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let user;
      if (isLogin) {
        user = await supabaseClient.signIn(email, password);
      } else {
        user = await supabaseClient.signUp(email, password);
      }
      
      setUser(user);
      if (onAuthChange) onAuthChange(user);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabaseClient.signOut();
      setUser(null);
      if (onAuthChange) onAuthChange(null);
    } catch (err) {
      setError(err.message || 'Sign out failed');
    }
  };

  if (user) {
    return (
      <div className="auth-status">
        <p>Welcome, {user.email}!</p>
        <button onClick={handleSignOut} disabled={loading}>
          {loading ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    );
  }

  return (
    <div className="auth-form">
      <h2>{isLogin ? 'Sign In' : 'Sign Up'}</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleAuth}>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
        </button>
      </form>
      
      <button 
        onClick={() => setIsLogin(!isLogin)}
        className="toggle-auth-mode"
      >
        {isLogin ? 'Need an account? Sign Up' : 'Have an account? Sign In'}
      </button>
    </div>
  );
};

export default Auth;