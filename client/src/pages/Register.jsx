import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../api/client.js';

const EMPTY = { name: '', identifier: '', password: '', confirm: '' };

export default function Register() {
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');

    setBusy(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name,
        identifier: form.identifier,
        password: form.password,
        role,
      });
      toast.success('Verification code sent');
      navigate('/verify', {
        state: { identifier: data.identifier, type: data.type, role, devCode: data.devCode },
      });
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        toast.error(getErrorMessage(err));
        navigate('/login');
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
          <h1>Create your account</h1>
          <p className="muted">Sign up with an email or phone number. We will verify it with an OTP.</p>
        </div>

        <div className="segmented">
          <button type="button" className={`seg-btn ${role === 'customer' ? 'active' : ''}`} onClick={() => setRole('customer')}>
            I'm a customer
          </button>
          <button type="button" className={`seg-btn ${role === 'seller' ? 'active' : ''}`} onClick={() => setRole('seller')}>
            I'm a seller
          </button>
        </div>

        <div className="field">
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" className="input" value={form.name} onChange={handleChange} required maxLength={60} />
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
          />
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" className="input" minLength={6} value={form.password} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="confirm">Confirm</label>
            <input id="confirm" name="confirm" type="password" className="input" minLength={6} value={form.confirm} onChange={handleChange} required />
          </div>
        </div>

        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Sending code…' : 'Continue & verify'}
        </button>

        <p className="muted" style={{ textAlign: 'center' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 600 }}>Log in</Link>
        </p>
      </form>
    </div>
  );
}
