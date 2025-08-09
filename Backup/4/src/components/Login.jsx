import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // More secure user validation (in real apps, use backend authentication)
  const validateUser = (username, password) => {
    const users = {
      'admin': 'adminjenish', // Stronger default password
      'murtibaugsurat@gmail.com': 'Murtibaug#19$30%',
    };
    return users[username] === password;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.username || !formData.password) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (validateUser(formData.username, formData.password)) {
      onLogin(true);
      navigate('/');
    } else {
      setError('Invalid username or password');
    }
    
    setIsLoading(false);
  };

  // Auto-focus username field on mount
  useEffect(() => {
    const usernameField = document.getElementById('username');
    if (usernameField) usernameField.focus();
  }, []);

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Kirtan Kadi App</h2>
          <p>Sign in to continue</p>
          {error && <div className="error-message">{error}</div>}
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              autoComplete="username"
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Contact admin at +91 7778932326 for access</p>
        </div>
      </div>
    </div>
  );
};

export default Login;