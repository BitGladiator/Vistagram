import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.login({ username, password });
      login(res.data.data.user, res.data.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <h1 style={styles.logo}>Vistagram</h1>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            placeholder="Username or email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button
            style={{
              ...styles.button,
              opacity: loading || !username || !password ? 0.6 : 1,
              cursor: loading || !username || !password ? 'not-allowed' : 'pointer'
            }}
            type="submit"
            disabled={loading || !username || !password}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>OR</span>
            <div style={styles.dividerLine} />
          </div>

          <p style={styles.forgotPassword}>Forgot password?</p>
        </form>
      </div>
      <div style={styles.registerCard}>
        <p style={styles.registerText}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.registerLink}>
            Sign up
          </Link>
        </p>
      </div>


      {/* <div style={styles.appDownload}>
        <p style={styles.appText}>Get the app.</p>
        <div style={styles.appButtons}>
          <div style={styles.appButton}>App Store</div>
          <div style={styles.appButton}>Google Play</div>
        </div>
      </div> */}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
    padding: '12px',
    gap: '10px',
  },
  card: {
    width: '100%',
    maxWidth: '350px',
    backgroundColor: '#fff',
    border: '1px solid #dbdbdb',
    borderRadius: '1px',
    padding: '40px 40px 24px',
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logo: {
    fontFamily: "'Billabong', 'Dancing Script', cursive, serif",
    fontSize: '42px',
    fontWeight: '400',
    letterSpacing: '-1px',
    color: '#262626',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  input: {
    width: '100%',
    padding: '9px 8px',
    backgroundColor: '#fafafa',
    border: '1px solid #dbdbdb',
    borderRadius: '3px',
    fontSize: '12px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  error: {
    color: '#ed4956',
    fontSize: '12px',
    textAlign: 'center',
    marginTop: '4px',
  },
  button: {
    width: '100%',
    padding: '7px 16px',
    backgroundColor: '#0095f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '8px',
    transition: 'opacity 0.2s',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    margin: '18px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#dbdbdb',
  },
  dividerText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#8e8e8e',
    letterSpacing: '1px',
  },
  forgotPassword: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#00376b',
    fontWeight: '600',
    cursor: 'pointer',
  },
  registerCard: {
    width: '100%',
    maxWidth: '350px',
    backgroundColor: '#fff',
    border: '1px solid #dbdbdb',
    borderRadius: '1px',
    padding: '20px',
    textAlign: 'center',
  },
  registerText: {
    fontSize: '14px',
    color: '#262626',
  },
  registerLink: {
    color: '#0095f6',
    fontWeight: '600',
  },
  appDownload: {
    textAlign: 'center',
    marginTop: '16px',
  },
  appText: {
    fontSize: '14px',
    color: '#262626',
    marginBottom: '12px',
  },
  appButtons: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
  },
  appButton: {
    border: '1px solid #262626',
    borderRadius: '6px',
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#262626',
    cursor: 'pointer',
  },
};