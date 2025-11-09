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
      setError(err.message || '认证失败');
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
      setError(err.message || '退出登录失败');
    }
  };

  if (user) {
    return (
      <div className="auth-status">
        <p>欢迎，{user.email}!</p>
        <button onClick={handleSignOut} disabled={loading}>
          {loading ? '正在退出...' : '退出登录'}
        </button>
      </div>
    );
  }

  return (
    <div className="auth-form">
      <h2>{isLogin ? '登录' : '注册'}</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleAuth}>
        <div className="form-group">
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
        </button>
      </form>
      
      <button 
        onClick={() => setIsLogin(!isLogin)}
        className="toggle-auth-mode"
      >
        {isLogin ? '需要账号？立即注册' : '已有账号？立即登录'}
      </button>
    </div>
  );
};

export default Auth;