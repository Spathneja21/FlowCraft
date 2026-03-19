import React, { useState, useRef, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordRef = useRef(null);

  const VALID_USER = 's';
  const VALID_PASS = '21';

  const handleInput = (e, setter) => {
    setter(e.target.value);
    if (error) setError(false);
  };

  useEffect(() => {
    if (error && passwordRef.current) {
      passwordRef.current.focus();
    }
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (error) setError(false);

    const user = username.trim();
    const pass = password;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (user === VALID_USER && pass === VALID_PASS) {
        setSuccess(true);
        setTimeout(() => { navigate('/workspace'); }, 1400);
      } else {
        setError(true);
        setPassword('');
      }
    }, 600);
  };

  return (
    <>
      <div className="grid-bg"></div>
      <div className="vignette"></div>

      <div className="corner tl"></div>
      <div className="corner tr"></div>
      <div className="corner bl"></div>
      <div className="corner br"></div>

      <div className="version-tag">FLOWCRAFT — v0.1.0 — PRIVATE</div>

      <div className="stage">
        <div className="card">

          <div className="card-header">
            <div className="logo-row">
              <div className="logo-mark">
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="7" height="7" rx="1" stroke="#5cdb8f" strokeWidth="1.2" />
                  <rect x="12" y="1" width="7" height="7" rx="1" stroke="#5cdb8f" strokeWidth="1.2" />
                  <rect x="6.5" y="12" width="7" height="7" rx="1" stroke="#5cdb8f" strokeWidth="1.2" />
                  <line x1="4.5" y1="8" x2="4.5" y2="15.5" stroke="#5cdb8f" strokeWidth="1" strokeOpacity="0.5" />
                  <line x1="15.5" y1="8" x2="15.5" y2="15.5" stroke="#5cdb8f" strokeWidth="1" strokeOpacity="0.5" />
                  <line x1="4.5" y1="15.5" x2="10" y2="15.5" stroke="#5cdb8f" strokeWidth="1" strokeOpacity="0.5" />
                  <line x1="15.5" y1="15.5" x2="10" y2="15.5" stroke="#5cdb8f" strokeWidth="1" strokeOpacity="0.5" />
                </svg>
              </div>
              <div className="logo-name">Flow<span>Craft</span></div>
            </div>
            <div className="tagline">// personal workspace — authorized access only</div>
          </div>

          <div className="card-body">
            <form id="login-form" autoComplete="off" noValidate onSubmit={handleSubmit}>

              <div className="field">
                <label htmlFor="username">Username</label>
                <div className="input-wrap">
                  <span className="input-prefix">@</span>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="your_username"
                    spellCheck="false"
                    autoComplete="off"
                    value={username}
                    onChange={(e) => handleInput(e, setUsername)}
                    className={error ? 'error' : ''}
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="password">Password</label>
                <div className="input-wrap">
                  <span className="input-prefix">#</span>
                  <input
                    ref={passwordRef}
                    type="password"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => handleInput(e, setPassword)}
                    className={error ? 'error' : ''}
                  />
                </div>
              </div>

              <div className={`error-msg ${error ? 'visible' : ''}`} id="error-msg">
                — invalid credentials. try again.
              </div>

              <div className="btn-row">
                <button type="submit" id="submit-btn" className={loading ? 'loading' : ''} disabled={loading}>
                  <span className="btn-shimmer"></span>
                  Enter workspace
                </button>
              </div>

            </form>
          </div>

          <div className="card-footer">
            <span>single-user mode</span>
            <span className="status-dot">
              <span className="dot"></span>
              system ready
            </span>
          </div>

        </div>
      </div>

      {/* Success screen */}
      <div className={`success-overlay ${success ? 'show' : ''}`} id="success-overlay">
        <div className="success-icon">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path className="check-path" d="M5 13 L11 19 L21 7" stroke="#5cdb8f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="success-label">Access granted</div>
        <div className="success-sub">loading workspace...</div>
      </div>
    </>
  );
};

export default Login;
