import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar glass">
      <Link to="/" className="brand">
        <span className="brand-logo">🍽️</span>
        Glassify Canteen
      </Link>

      <nav className="nav-links">
        <a href="/#about">About</a>

        {!user && (
          <>
            <NavLink to="/login">Login</NavLink>
            <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
          </>
        )}

        {user?.role === 'customer' && (
          <>
            <NavLink to="/customer" end>Shops</NavLink>
            <NavLink to="/customer/orders">My Orders</NavLink>
          </>
        )}

        {user?.role === 'seller' && <NavLink to="/seller">Seller Dashboard</NavLink>}

        {user && (
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Logout
          </button>
        )}
      </nav>
    </header>
  );
}
