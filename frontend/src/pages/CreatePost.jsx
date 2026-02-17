import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postAPI, mediaAPI } from '../services/api';

// ── Icons ─────────────────────────────────────────────────────────────────────

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ImageIcon = () => (
  <svg width="77" height="77" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ── Avatar ────────────────────────────────────────────────────────────────────

const Avatar = ({ username, size = 32 }) => {
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

// ── Steps ─────────────────────────────────────────────────────────────────────
// Step 1: Select photo
// Step 2: Edit / preview
// Step 3: Write caption + share

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1); // 1 = select, 2 = preview, 3 = caption
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const MAX_CHARS = 2200;

  // ── File handling ──────────────────────────────────────────────────────────

  const handleFile = useCallback((selectedFile) => {
    if (!selectedFile) return;

    // Validate type
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB');
      return;
    }

    setError('');
    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setStep(2);
    };
    reader.readAsDataURL(selectedFile);
  }, []);

  const handleFileInput = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleShare = async () => {
    if (!caption.trim()) {
      setError('Please write a caption');
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Step 1: Create post
      setUploadProgress(20);
      const postRes = await postAPI.create({
        caption: caption.trim(),
        location: location.trim() || undefined,
      });

      const post_id = postRes.data.data.post.post_id;
      setUploadProgress(40);

      // Step 2: Upload image if selected
      if (file) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('post_id', post_id);

        setUploadProgress(60);
        await mediaAPI.upload(formData);
        setUploadProgress(90);
      }

      setUploadProgress(100);

      // Success! Go to feed
      setTimeout(() => navigate('/'), 500);

    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to share post');
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // ── Render: Step 1 - Select Photo ──────────────────────────────────────────

  const renderSelectStep = () => (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.headerBtn}>
          <CloseIcon />
        </button>
        <span style={styles.headerTitle}>Create new post</span>
        <div style={{ width: 40 }} />
      </div>

      {/* Drop zone */}
      <div
        style={{
          ...styles.dropzone,
          borderColor: dragOver ? '#0095f6' : '#dbdbdb',
          backgroundColor: dragOver ? '#f0f8ff' : '#fafafa',
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImageIcon />
        <p style={styles.dropzoneTitle}>Drag photos here</p>
        <p style={styles.dropzoneSubtitle}>Share your moments with the world</p>
        {error && <p style={styles.error}>{error}</p>}
        <button
          style={styles.selectBtn}
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
        >
          Select from computer
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />
    </div>
  );

  // ── Render: Step 2 - Preview ───────────────────────────────────────────────

  const renderPreviewStep = () => (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => { setStep(1); setFile(null); setPreview(null); }} style={styles.headerBtn}>
          <BackIcon />
        </button>
        <span style={styles.headerTitle}>Crop</span>
        <button
          onClick={() => setStep(3)}
          style={{ ...styles.headerBtn, color: '#0095f6', fontWeight: '600', fontSize: 14 }}
        >
          Next
        </button>
      </div>

      {/* Preview image */}
      <div style={styles.previewContainer}>
        <img
          src={preview}
          alt="preview"
          style={styles.previewImage}
        />
      </div>

      {/* File info */}
      <div style={styles.fileInfo}>
        <span style={styles.fileName}>{file?.name}</span>
        <span style={styles.fileSize}>{(file?.size / 1024 / 1024).toFixed(2)} MB</span>
      </div>
    </div>
  );

  // ── Render: Step 3 - Caption ───────────────────────────────────────────────

  const renderCaptionStep = () => (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => setStep(2)} style={styles.headerBtn}>
          <BackIcon />
        </button>
        <span style={styles.headerTitle}>New post</span>
        <button
          onClick={handleShare}
          disabled={loading || !caption.trim()}
          style={{
            ...styles.headerBtn,
            color: loading || !caption.trim() ? '#b2dffc' : '#0095f6',
            fontWeight: '600', fontSize: 14,
            cursor: loading || !caption.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Sharing...' : 'Share'}
        </button>
      </div>

      <div style={styles.captionLayout}>
        {/* Left: image thumbnail */}
        <div style={styles.thumbnailContainer}>
          <img src={preview} alt="preview" style={styles.thumbnail} />
        </div>

        {/* Right: caption */}
        <div style={styles.captionRight}>
          <div style={styles.captionUser}>
            <Avatar username={user?.username} size={28} />
            <span style={styles.captionUsername}>{user?.username}</span>
          </div>

          <textarea
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, MAX_CHARS))}
            style={styles.captionInput}
            autoFocus
          />

          <div style={styles.charCount}>
            <span style={{ color: caption.length > MAX_CHARS * 0.9 ? '#ed4956' : '#c7c7c7' }}>
              {caption.length}/{MAX_CHARS}
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Location */}
      <div style={styles.locationRow}>
        <input
          placeholder="Add location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={styles.locationInput}
        />
        <LocationIcon />
      </div>

      <div style={styles.divider} />

      {/* Accessibility */}
      <div style={styles.optionRow}>
        <span style={styles.optionLabel}>Accessibility</span>
        <span style={styles.optionArrow}>›</span>
      </div>

      <div style={styles.divider} />

      {/* Advanced settings */}
      <div style={styles.optionRow}>
        <span style={styles.optionLabel}>Advanced settings</span>
        <span style={styles.optionArrow}>›</span>
      </div>

      <div style={styles.divider} />

      {/* Error */}
      {error && <p style={{ ...styles.error, padding: '12px 16px' }}>{error}</p>}

      {/* Progress bar */}
      {loading && (
        <div style={styles.progressContainer}>
          <div style={{ ...styles.progressBar, width: `${uploadProgress}%` }} />
          <p style={styles.progressText}>
            {uploadProgress < 40 ? 'Creating post...' :
             uploadProgress < 80 ? 'Uploading image...' :
             'Almost done...'}
          </p>
        </div>
      )}
    </div>
  );

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div style={styles.page}>
      {/* Top nav */}
      <div style={styles.navbar}>
        <div style={styles.navInner}>
          <h1
            style={styles.logo}
            onClick={() => navigate('/')}
          >
            Vistagram
          </h1>
        </div>
      </div>

      {/* Card */}
      <div style={styles.card}>
        {step === 1 && renderSelectStep()}
        {step === 2 && renderPreviewStep()}
        {step === 3 && renderCaptionStep()}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

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
    display: 'flex', alignItems: 'center', padding: '0 20px',
  },
  logo: {
    fontFamily: "'Billabong', 'Dancing Script', cursive, serif",
    fontSize: 28, fontWeight: '400', color: '#262626', cursor: 'pointer',
  },
  card: {
    maxWidth: 600,
    margin: '40px auto',
    backgroundColor: '#fff',
    border: '1px solid #dbdbdb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 8px',
    borderBottom: '1px solid #dbdbdb',
    height: 48,
  },
  headerBtn: {
    background: 'none', border: 'none',
    cursor: 'pointer', padding: '8px',
    display: 'flex', alignItems: 'center',
    minWidth: 40,
  },
  headerTitle: {
    fontSize: 16, fontWeight: '600', color: '#262626',
  },

  // Step 1 - Drop zone
  dropzone: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '80px 40px',
    border: '2px dashed #dbdbdb',
    margin: 24, borderRadius: 4,
    cursor: 'pointer', transition: 'all 0.2s',
    gap: 12,
  },
  dropzoneTitle: {
    fontSize: 22, fontWeight: '300', color: '#262626',
    marginTop: 8,
  },
  dropzoneSubtitle: {
    fontSize: 14, color: '#8e8e8e',
  },
  selectBtn: {
    marginTop: 8,
    padding: '8px 20px',
    backgroundColor: '#0095f6',
    color: '#fff',
    border: 'none', borderRadius: 8,
    fontSize: 14, fontWeight: '600',
    cursor: 'pointer',
  },
  error: {
    color: '#ed4956', fontSize: 13, textAlign: 'center',
  },

  // Step 2 - Preview
  previewContainer: {
    width: '100%', aspectRatio: '1',
    overflow: 'hidden', backgroundColor: '#000',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  previewImage: {
    width: '100%', height: '100%', objectFit: 'contain',
  },
  fileInfo: {
    display: 'flex', justifyContent: 'space-between',
    padding: '12px 16px', borderTop: '1px solid #dbdbdb',
  },
  fileName: {
    fontSize: 13, color: '#262626',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    maxWidth: '70%',
  },
  fileSize: {
    fontSize: 13, color: '#8e8e8e',
  },

  // Step 3 - Caption
  captionLayout: {
    display: 'flex', gap: 16,
    padding: 16, minHeight: 200,
  },
  thumbnailContainer: {
    width: 110, height: 110, flexShrink: 0,
    overflow: 'hidden', borderRadius: 3,
    backgroundColor: '#000',
  },
  thumbnail: {
    width: '100%', height: '100%', objectFit: 'cover',
  },
  captionRight: {
    flex: 1, display: 'flex', flexDirection: 'column', gap: 8,
  },
  captionUser: {
    display: 'flex', alignItems: 'center', gap: 8,
  },
  captionUsername: {
    fontSize: 14, fontWeight: '600', color: '#262626',
  },
  captionInput: {
    border: 'none', outline: 'none', resize: 'none',
    fontSize: 16, color: '#262626', lineHeight: '24px',
    flex: 1, minHeight: 120, fontFamily: 'inherit',
    backgroundColor: 'transparent',
  },
  charCount: {
    textAlign: 'right', fontSize: 12,
  },
  divider: {
    height: 1, backgroundColor: '#dbdbdb',
  },
  locationRow: {
    display: 'flex', alignItems: 'center',
    padding: '12px 16px', gap: 8,
  },
  locationInput: {
    border: 'none', outline: 'none', flex: 1,
    fontSize: 16, color: '#262626', fontFamily: 'inherit',
    backgroundColor: 'transparent',
  },
  optionRow: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px', cursor: 'pointer',
  },
  optionLabel: {
    fontSize: 16, color: '#262626',
  },
  optionArrow: {
    fontSize: 20, color: '#8e8e8e',
  },

  // Progress
  progressContainer: {
    padding: '16px',
  },
  progressBar: {
    height: 3, backgroundColor: '#0095f6',
    borderRadius: 2, transition: 'width 0.3s ease',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13, color: '#8e8e8e', textAlign: 'center',
  },
};