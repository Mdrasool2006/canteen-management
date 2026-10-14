import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Where each role lands after login
export const homePathFor = (role) => (role === 'seller' ? '/seller' : '/customer');

// Guards a page: requires a logged-in user, optionally with a specific role
export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="page-loader">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={homePathFor(user.role)} replace />;

  return children;
}
