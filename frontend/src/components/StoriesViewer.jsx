import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';


const CloseIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const ChevronLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="3">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="3">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const PauseIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
  </svg>
);

const PlayIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);


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



export default function StoriesViewer({ 
  stories, // Array of story groups: [{ user_id, username, stories: [...] }]
  initialUserIndex = 0,
  initialStoryIndex = 0,
  onClose 
}) {
  const { user } = useAuth();
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef(null);

  const currentUserStories = stories[currentUserIndex];
  const currentStory = currentUserStories?.stories[currentStoryIndex];
  const totalStories = currentUserStories?.stories.length || 0;

 

  useEffect(() => {
    if (!currentStory || paused) return;

    const duration = (currentStory.duration_seconds || 5) * 1000;
    const tickInterval = 50;
    let elapsed = 0;

    setProgress(0);

    progressInterval.current = setInterval(() => {
      elapsed += tickInterval;
      const newProgress = (elapsed / duration) * 100;
      setProgress(newProgress);

      if (newProgress >= 100) {
        goToNext();
      }
    }, tickInterval);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentUserIndex, currentStoryIndex, paused]);

  

  const goToNext = () => {
    if (currentStoryIndex < totalStories - 1) {
      // Next story in same user
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
    } else if (currentUserIndex < stories.length - 1) {
      // Next user
      setCurrentUserIndex(currentUserIndex + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    } else {
      // End of all stories
      onClose();
    }
  };

  const goToPrevious = () => {
    if (currentStoryIndex > 0) {
      // Previous story in same user
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
    } else if (currentUserIndex > 0) {
      // Previous user's last story
      setCurrentUserIndex(currentUserIndex - 1);
      const prevUserStories = stories[currentUserIndex - 1].stories;
      setCurrentStoryIndex(prevUserStories.length - 1);
      setProgress(0);
    }
  };

  const goToNextUser = () => {
    if (currentUserIndex < stories.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const goToPreviousUser = () => {
    if (currentUserIndex > 0) {
      setCurrentUserIndex(currentUserIndex - 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    }
  };

  

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === ' ') { e.preventDefault(); setPaused(p => !p); }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUserIndex, currentStoryIndex]);



  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width * 0.3) {
      goToPrevious();
    } else if (x > width * 0.7) {
      goToNext();
    } else {
      setPaused(p => !p);
    }
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'just now';
    if (hours === 1) return '1h ago';
    return `${hours}h ago`;
  };

  if (!currentStory) return null;

  return (
    <div style={styles.backdrop}>
      <div style={styles.container}>
        
     
        <button onClick={onClose} style={styles.closeBtn}>
          <CloseIcon />
        </button>

     
        {currentUserIndex > 0 && (
          <button onClick={goToPreviousUser} style={{ ...styles.navBtn, left: 20 }}>
            <ChevronLeft />
          </button>
        )}


        {currentUserIndex < stories.length - 1 && (
          <button onClick={goToNextUser} style={{ ...styles.navBtn, right: 20 }}>
            <ChevronRight />
          </button>
        )}

       
        <div style={styles.storyCard}>
          
         
          <div style={styles.progressBars}>
            {currentUserStories.stories.map((_, idx) => (
              <div key={idx} style={styles.progressBarOuter}>
                <div
                  style={{
                    ...styles.progressBarInner,
                    width: 
                      idx < currentStoryIndex ? '100%' :
                      idx === currentStoryIndex ? `${progress}%` :
                      '0%'
                  }}
                />
              </div>
            ))}
          </div>

        
          <div style={styles.header}>
            <Avatar username={currentUserStories.username} size={32} />
            <div style={{ flex: 1 }}>
              <div style={styles.username}>{currentUserStories.username}</div>
              <div style={styles.timeAgo}>{timeAgo(currentStory.created_at)}</div>
            </div>
            <button onClick={() => setPaused(p => !p)} style={styles.pauseBtn}>
              {paused ? <PlayIcon /> : <PauseIcon />}
            </button>
          </div>

          
          <div
            style={styles.content}
            onClick={handleClick}
          >
            <img
              src={currentStory.media_url}
              alt="story"
              style={styles.image}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

     
          {currentUserStories.user_id === user?.user_id && (
            <div style={styles.viewCount}>
              👁 {currentStory.view_count || 0} views
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



const styles = {
  backdrop: {
    position: 'fixed', inset: 0, zIndex: 2000,
    backgroundColor: 'rgba(0,0,0,0.9)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  container: {
    position: 'relative',
    width: '100%', maxWidth: 500,
    height: '100vh', maxHeight: 900,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute', top: 20, right: 20, zIndex: 2001,
    background: 'none', border: 'none', cursor: 'pointer',
    padding: 8, opacity: 0.8,
  },
  navBtn: {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    zIndex: 2001, background: 'rgba(0,0,0,0.5)', border: 'none',
    cursor: 'pointer', padding: 12, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: 0.7,
  },
  storyCard: {
    position: 'relative',
    width: '100%', height: '100%',
    backgroundColor: '#000',
    borderRadius: 8, overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
  },
  progressBars: {
    position: 'absolute', top: 0, left: 0, right: 0,
    display: 'flex', gap: 4, padding: '12px 12px 0',
    zIndex: 10,
  },
  progressBarOuter: {
    flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2, overflow: 'hidden',
  },
  progressBarInner: {
    height: '100%', backgroundColor: '#fff',
    transition: 'width 0.05s linear',
  },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0,
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '48px 16px 16px', zIndex: 10,
    background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)',
  },
  username: {
    fontSize: 14, fontWeight: '600', color: '#fff',
  },
  timeAgo: {
    fontSize: 12, color: 'rgba(255,255,255,0.8)',
  },
  pauseBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: 4, opacity: 0,
  },
  content: {
    flex: 1, position: 'relative',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', userSelect: 'none',
  },
  image: {
    maxWidth: '100%', maxHeight: '100%',
    objectFit: 'contain',
  },
  viewCount: {
    position: 'absolute', bottom: 20, left: '50%',
    transform: 'translateX(-50%)',
    padding: '8px 16px', borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    fontSize: 14, color: '#fff', fontWeight: '500',
    zIndex: 10,
  },
};