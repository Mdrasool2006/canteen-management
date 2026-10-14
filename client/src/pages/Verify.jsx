import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { homePathFor } from '../components/ProtectedRoute.jsx';

const RESEND_SECONDS = 30;

export default function Verify() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { saveSession } = useAuth();

  const identifier = state?.identifier;
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [devCode, setDevCode] = useState(state?.devCode);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  // Resend countdown
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (!identifier) {
    return (
      <div className="auth-wrap">
        <div className="glass auth-card">
          <h1>Nothing to verify</h1>
          <p className="muted">Start by creating an account or logging in.</p>
          <Link to="/register" className="btn btn-primary">Create account</Link>
        </div>
      </div>
    );
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { identifier, code });
      saveSession(data.token, data.user);
      toast.success('Account verified!');
      navigate(homePathFor(data.user.role));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    try {
      const { data } = await api.post('/auth/resend-otp', { identifier });
      setDevCode(data.devCode);
      setCooldown(RESEND_SECONDS);
      toast.success('A new code has been sent');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="auth-wrap">
      <form className="glass auth-card" onSubmit={handleVerify}>
        <div>
          <h1>Verify your account</h1>
          <p className="muted">
            Enter the 6-digit code sent to <strong>{identifier}</strong>.
          </p>
        </div>

        {devCode && (
          <div className="banner-dev">
            Development mode – your code is <strong>{devCode}</strong>. Configure SMTP or Twilio to deliver real codes.
          </div>
        )}

        <input
          className="input otp-input"
          inputMode="numeric"
          maxLength={6}
          placeholder="••••••"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          required
          autoFocus
        />

        <button className="btn btn-primary btn-block" disabled={busy || code.length !== 6}>
          {busy ? 'Verifying…' : 'Verify & continue'}
        </button>

        <p className="muted" style={{ textAlign: 'center' }}>
          Didn't get it?{' '}
          <button type="button" className="btn btn-ghost btn-sm" disabled={cooldown > 0} onClick={handleResend}>
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
          </button>
        </p>
      </form>
    </div>
  );
}
