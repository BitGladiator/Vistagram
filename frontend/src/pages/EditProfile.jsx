import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';


const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);


const Avatar = ({ username, size = 80 }) => {
  const colors = ['#f09433','#e6683c','#dc2743','#cc2366','#bc1888','#8a3ab9','#4c68d7'];
  const color = colors[username?.charCodeAt(0) % colors.length] || '#ccc';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      backgroundColor: color, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: '600', color: '#fff', flexShrink: 0,
    }}>
      {username?.slice(0, 1).toUpperCase()}
    </div>
  );
};


export default function EditProfile() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    email: '',
    is_private: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getProfile(user?.user_id);
      const profileData = res.data?.data?.user || res.data?.user;
      
      setFormData({
        full_name: profileData.full_name || '',
        username: profileData.username || '',
        bio: profileData.bio || '',
        email: profileData.email || '',
        is_private: profileData.is_private || false,
      });
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
  
    if (!formData.full_name.trim()) {
      setError('Name is required');
      return;
    }

    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }

    if (formData.username.length < 3 || formData.username.length > 30) {
      setError('Username must be between 3 and 30 characters');
      return;
    }

    if (formData.bio.length > 150) {
      setError('Bio must be 150 characters or less');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await userAPI.updateProfile(user?.user_id, {
        full_name: formData.full_name.trim(),
        bio: formData.bio.trim(),
        is_private: formData.is_private,
      });

      const updatedUser = res.data?.data?.user || res.data?.user;
      
      // Update auth context with new user data
      const token = localStorage.getItem('token');
      login(updatedUser, token);

      setSuccess('Profile updated successfully!');
      
     
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || 'Failed to update profile';
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const isValidUrl = (url) => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.navbar}>
          <div style={styles.navInner}>
            <h1 style={styles.logo}>Vistagram</h1>
          </div>
        </div>
        <div style={styles.container}>
          <div style={{ textAlign: 'center', padding: 40, color: '#8e8e8e' }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.navbar}>
        <div style={styles.navInner}>
          <button onClick={() => navigate('/profile')} style={styles.backBtn}>
            <BackIcon />
          </button>
          <h1 style={styles.logo} onClick={() => navigate('/')}>Vistagram</h1>
          <div style={{ width: 40 }} />
        </div>
      </div>


      <div style={styles.container}>
        <div style={styles.card}>
          

          <div style={styles.sidebar}>
            <button style={styles.sidebarItem}>
              <span>Edit Profile</span>
            </button>
            <button style={styles.sidebarItemInactive}>
              <span>Change Password</span>
            </button>
            <button style={styles.sidebarItemInactive}>
              <span>Privacy and Security</span>
            </button>
          </div>

          <div style={styles.formSection}>
            <form onSubmit={handleSubmit}>
              
             
              <div style={styles.formGroup}>
                <div style={styles.labelCol}>
                  <label style={styles.label}></label>
                </div>
                <div style={styles.inputCol}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <Avatar username={formData.username} size={48} />
                    <div>
                      <div style={{ fontSize: 20, fontWeight: '400', color: '#262626', marginBottom: 2 }}>
                        {formData.username}
                      </div>
                      <button
                        type="button"
                        style={styles.changePhotoBtn}
                      >
                        Change profile photo
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            
              <div style={styles.formGroup}>
                <div style={styles.labelCol}>
                  <label style={styles.label}>Name</label>
                </div>
                <div style={styles.inputCol}>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Name"
                  />
                  <p style={styles.helpText}>
                    Help people discover your account by using the name you're known by.
                  </p>
                </div>
              </div>

            
              <div style={styles.formGroup}>
                <div style={styles.labelCol}>
                  <label style={styles.label}>Username</label>
                </div>
                <div style={styles.inputCol}>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Username"
                  />
                  <p style={styles.helpText}>
                    You can change your username anytime.
                  </p>
                </div>
              </div>

             
              <div style={styles.formGroup}>
                <div style={styles.labelCol}>
                  <label style={styles.label}>Private Account</label>
                </div>
                <div style={styles.inputCol}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="is_private"
                      checked={formData.is_private}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_private: e.target.checked }))}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 14, color: '#262626' }}>
                      When your account is private, only people you approve can see your photos and videos.
                    </span>
                  </label>
                </div>
              </div>

        
              <div style={styles.formGroup}>
                <div style={styles.labelCol}>
                  <label style={styles.label}>Bio</label>
                </div>
                <div style={styles.inputCol}>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    style={styles.textarea}
                    placeholder="Bio"
                    rows="3"
                    maxLength="150"
                  />
                  <p style={styles.charCount}>
                    {formData.bio.length} / 150
                  </p>
                </div>
              </div>

            
              <div style={styles.formGroup}>
                <div style={styles.labelCol}>
                  <label style={styles.label}>Email</label>
                </div>
                <div style={styles.inputCol}>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    style={{ ...styles.input, backgroundColor: '#fafafa', cursor: 'not-allowed' }}
                    disabled
                  />
                  <p style={styles.helpText}>
                    Contact support to change your email address.
                  </p>
                </div>
              </div>

             
              {error && (
                <div style={styles.formGroup}>
                  <div style={styles.labelCol}></div>
                  <div style={styles.inputCol}>
                    <div style={styles.errorMsg}>{error}</div>
                  </div>
                </div>
              )}

              {success && (
                <div style={styles.formGroup}>
                  <div style={styles.labelCol}></div>
                  <div style={styles.inputCol}>
                    <div style={styles.successMsg}>{success}</div>
                  </div>
                </div>
              )}

           
              <div style={styles.formGroup}>
                <div style={styles.labelCol}></div>
                <div style={styles.inputCol}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      ...styles.submitBtn,
                      opacity: saving ? 0.6 : 1,
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Submit'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}



const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#fafafa',
  },
  navbar: {
    position: 'sticky', top: 0, zIndex: 100,
    backgroundColor: '#fff', borderBottom: '1px solid #dbdbdb',
    height: 60,
  },
  navInner: {
    maxWidth: 935, margin: '0 auto', height: '100%',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', padding: '0 20px',
  },
  logo: {
    fontFamily: "'Billabong', 'Dancing Script', cursive, serif",
    fontSize: 28, fontWeight: '400', color: '#262626', cursor: 'pointer',
  },
  backBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: 4, display: 'flex', alignItems: 'center',
  },
  container: {
    maxWidth: 935, margin: '30px auto', padding: '0 20px',
  },
  card: {
    backgroundColor: '#fff',
    border: '1px solid #dbdbdb',
    borderRadius: 3,
    display: 'flex',
    minHeight: 400,
  },
  sidebar: {
    width: 236,
    borderRight: '1px solid #dbdbdb',
    flexShrink: 0,
  },
  sidebarItem: {
    width: '100%',
    padding: '16px 16px 16px 30px',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    borderLeft: '2px solid #262626',
    fontSize: 16,
    fontWeight: '600',
    color: '#262626',
    cursor: 'pointer',
  },
  sidebarItemInactive: {
    width: '100%',
    padding: '16px 16px 16px 30px',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    borderLeft: '2px solid transparent',
    fontSize: 16,
    color: '#262626',
    cursor: 'pointer',
  },
  formSection: {
    flex: 1,
    padding: '32px 0',
  },
  formGroup: {
    display: 'flex',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  labelCol: {
    width: 194,
    paddingRight: 32,
    paddingTop: 8,
    textAlign: 'right',
    flexShrink: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#262626',
  },
  inputCol: {
    flex: 1,
    maxWidth: 355,
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #dbdbdb',
    borderRadius: 3,
    fontSize: 16,
    color: '#262626',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #dbdbdb',
    borderRadius: 3,
    fontSize: 16,
    color: '#262626',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  helpText: {
    fontSize: 12,
    color: '#8e8e8e',
    marginTop: 8,
    lineHeight: '16px',
  },
  charCount: {
    fontSize: 12,
    color: '#8e8e8e',
    marginTop: 4,
    textAlign: 'right',
  },
  changePhotoBtn: {
    background: 'none',
    border: 'none',
    color: '#0095f6',
    fontSize: 14,
    fontWeight: '600',
    cursor: 'pointer',
    padding: 0,
  },
  submitBtn: {
    padding: '8px 24px',
    backgroundColor: '#0095f6',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    fontSize: 14,
    fontWeight: '600',
    cursor: 'pointer',
  },
  errorMsg: {
    padding: '12px 16px',
    backgroundColor: '#ffebee',
    color: '#d32f2f',
    borderRadius: 4,
    fontSize: 14,
  },
  successMsg: {
    padding: '12px 16px',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    borderRadius: 4,
    fontSize: 14,
  },
};