import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Feed from './pages/Feed'
import CreatePost from './pages/CreatePost'
// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth(); // Use the useAuth hook
  if (loading) return <div>Loading...</div>; 
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public route 
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return !isAuthenticated ? children : <Navigate to="/" />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
      <Route path="/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
    </Routes>
  );
}