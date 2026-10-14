import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { homePathFor } from '../components/ProtectedRoute.jsx';

export default function Login() {
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [busy, setBusy] = useState(false);
  const { saveSession } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/auth/login', { ...form, role });
      saveSession(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(homePathFor(data.user.role));
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        const { identifier, type } = err.response.data;
        // Send a fresh code so the user can finish verification
        await api.post('/auth/resend-otp', { identifier }).catch(() => {});
        toast('Please verify your account. We sent you a code.');
        navigate('/verify', { state: { identifier, type, role } });
      } else {
        toast.error(getErrorMessage(err));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="glass auth-card" onSubmit={handleSubmit}>
        <div>
          <h1>Welcome back</h1>
          <p className="muted">Log in with your email or phone number.</p>
        </div>

        <div className="segmented" role="tablist">
          <button type="button" className={`seg-btn ${role === 'customer' ? 'active' : ''}`} onClick={() => setRole('customer')}>
            Customer
          </button>
          <button type="button" className={`seg-btn ${role === 'seller' ? 'active' : ''}`} onClick={() => setRole('seller')}>
            Seller
          </button>
        </div>

        <div className="field">
          <label htmlFor="identifier">Email or phone number</label>
          <input
            id="identifier"
            name="identifier"
            className="input"
            placeholder="you@example.com or 9876543210"
            value={form.identifier}
            onChange={handleChange}
            required
            autoComplete="username"
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className="input"
            placeholder="Your password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
        </div>

        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>

        <p className="muted" style={{ textAlign: 'center' }}>
          New here? <Link to="/register" style={{ color: 'var(--brand)', fontWeight: 600 }}>Create an account</Link>
        </p>
      </form>
    </div>
  );
}
