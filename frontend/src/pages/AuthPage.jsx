import { useState } from 'react';
import { registerUser, loginUser } from '../api';

function AuthPage({ onAuthSuccess, pushToast, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Email and password are required');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'register') {
        const res = await registerUser({ email, password });
        pushToast('success', 'Registration successful! Logged in.');
        onAuthSuccess(res.user);
      } else {
        const res = await loginUser({ email, password });
        pushToast('success', 'Login successful!');
        onAuthSuccess(res.user);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed');
      pushToast('error', err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h2>{mode === 'register' ? 'Register' : 'Login'}</h2>
        
        {errorMsg && <div className="auth-error-banner">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
            {submitting
              ? mode === 'register' ? 'Registering...' : 'Logging in...'
              : mode === 'register' ? 'Register' : 'Login'}
          </button>
        </form>

        <div className="auth-toggle">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                className="btn-link"
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                }}
              >
                Register
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                className="btn-link"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
              >
                Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
