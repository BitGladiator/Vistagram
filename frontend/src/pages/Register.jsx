import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function Register() {
  const [form, setForm] = useState({
    email: '', full_name: '', username: '', password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.full_name || !form.username || !form.password) {
      setError('Please fill in all fields');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.register(form);
      login(res.data.data.user, res.data.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const isValid = form.email && form.full_name && form.username && form.password.length >= 8;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <h1 style={styles.logo}>Vistagram</h1>
          <p style={styles.tagline}>Sign up to see photos and videos from your friends.</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {['email', 'full_name', 'username', 'password'].map((field) => (
            <input
              key={field}
              style={styles.input}
              type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
              name={field}
              placeholder={
                field === 'full_name' ? 'Full Name' :
                field === 'email' ? 'Email address' :
                field === 'username' ? 'Username' : 'Password'
              }
              value={form[field]}
              onChange={handleChange}
              autoCapitalize={field === 'full_name' ? 'words' : 'none'}
            />
          ))}

          {error && <p style={styles.error}>{error}</p>}

          <button
            style={{
              ...styles.button,
              opacity: isValid && !loading ? 1 : 0.6,
              cursor: isValid && !loading ? 'pointer' : 'not-allowed'
            }}
            type="submit"
            disabled={!isValid || loading}
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>

          <p style={styles.terms}>
            By signing up, you agree to our{' '}
            <span style={styles.link}>Terms</span>,{' '}
            <span style={styles.link}>Privacy Policy</span> and{' '}
            <span style={styles.link}>Cookies Policy</span>.
          </p>
        </form>
      </div>

      <div style={styles.loginCard}>
        <p style={styles.loginText}>
          Have an account?{' '}
          <Link to="/login" style={styles.loginLink}>Log in</Link>
        </p>
      </div>
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
    padding: '40px 40px 24px',
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  logo: {
    fontFamily: "'Billabong', cursive, serif",
    fontSize: '42px',
    fontWeight: '400',
    color: '#262626',
    marginBottom: '16px',
  },
  tagline: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#8e8e8e',
    textAlign: 'center',
    lineHeight: '20px',
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
  },
  error: {
    color: '#ed4956',
    fontSize: '12px',
    textAlign: 'center',
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
  terms: {
    fontSize: '11px',
    color: '#8e8e8e',
    textAlign: 'center',
    marginTop: '12px',
    lineHeight: '16px',
  },
  link: {
    fontWeight: '600',
    cursor: 'pointer',
  },
  loginCard: {
    width: '100%',
    maxWidth: '350px',
    backgroundColor: '#fff',
    border: '1px solid #dbdbdb',
    padding: '20px',
    textAlign: 'center',
  },
  loginText: {
    fontSize: '14px',
  },
  loginLink: {
    color: '#0095f6',
    fontWeight: '600',
  },
};