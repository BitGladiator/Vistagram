import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mediaAPI } from '../services/api';



const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const ImageIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

export default function CreateStory({ onClose, onSuccess }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB');
      return;
    }

    setError('');
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleFileInput = (e) => handleFile(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); };
  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const handleShare = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
    
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'story'); // Special flag for stories

      const res = await mediaAPI.uploadStory(formData);
      const media_url = res.data?.data?.media?.urls?.medium || res.data?.data?.url;

      // Create story record
      const storyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-user-id': user?.user_id,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          media_url,
          media_type: 'image',
          duration_seconds: 5,
        }),
      });

      if (!storyRes.ok) throw new Error('Failed to create story');

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Story upload error:', err);
      setError(err.message || 'Failed to share story');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={styles.modal}>
        
      
        <div style={styles.header}>
          <span style={styles.title}>Create story</span>
          <button onClick={onClose} style={styles.closeBtn}>
            <CloseIcon />
          </button>
        </div>

       
        {!preview ? (
          // Upload zone
          <div
            style={{
              ...styles.dropzone,
              borderColor: dragOver ? '#0095f6' : 'rgba(255,255,255,0.3)',
              backgroundColor: dragOver ? 'rgba(0,149,246,0.1)' : 'transparent',
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon />
            <p style={styles.dropzoneTitle}>Drag photo here</p>
            <button
              style={styles.selectBtn}
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            >
              Select from computer
            </button>
            {error && <p style={styles.error}>{error}</p>}
          </div>
        ) : (
          // Preview
          <div style={styles.previewContainer}>
            <img src={preview} alt="preview" style={styles.previewImage} />
            
            <div style={styles.previewActions}>
              <button
                onClick={() => { setFile(null); setPreview(null); }}
                style={styles.actionBtn}
              >
                Change
              </button>
              <button
                onClick={handleShare}
                disabled={loading}
                style={{
                  ...styles.actionBtn,
                  ...styles.shareBtn,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Sharing...' : 'Share to story'}
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}



const styles = {
  backdrop: {
    position: 'fixed', inset: 0, zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.85)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20,
  },
  modal: {
    width: '100%', maxWidth: 500,
    backgroundColor: '#262626',
    borderRadius: 12, overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 16, fontWeight: '600', color: '#fff',
  },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: 8, display: 'flex',
  },
  dropzone: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '80px 40px', margin: 20,
    border: '2px dashed rgba(255,255,255,0.3)',
    borderRadius: 8, cursor: 'pointer',
    transition: 'all 0.2s', gap: 16,
  },
  dropzoneTitle: {
    fontSize: 18, fontWeight: '300', color: '#fff',
  },
  selectBtn: {
    padding: '10px 24px', marginTop: 8,
    backgroundColor: '#0095f6', color: '#fff',
    border: 'none', borderRadius: 8,
    fontSize: 14, fontWeight: '600', cursor: 'pointer',
  },
  error: {
    color: '#ed4956', fontSize: 13, marginTop: 8,
  },
  previewContainer: {
    position: 'relative',
    aspectRatio: '9/16',
    maxHeight: 600,
    backgroundColor: '#000',
    display: 'flex', flexDirection: 'column',
  },
  previewImage: {
    flex: 1, width: '100%', objectFit: 'contain',
  },
  previewActions: {
    display: 'flex', gap: 12,
    padding: 16, backgroundColor: '#262626',
  },
  actionBtn: {
    flex: 1, padding: '12px',
    background: 'none', color: '#fff',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: 8, fontSize: 14, fontWeight: '600',
    cursor: 'pointer',
  },
  shareBtn: {
    backgroundColor: '#0095f6',
    border: 'none',
  },
};