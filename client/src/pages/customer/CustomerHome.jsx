import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../api/client.js';
import ShopCard from '../../components/ShopCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function CustomerHome() {
  const { user } = useAuth();
  const [shops, setShops] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/shops')
      .then(({ data }) => setShops(data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = shops.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="page">
      <h1 className="page-title">Hi {user?.name?.split(' ')[0]} 👋</h1>
      <p className="muted">Pick a canteen stall to see its menu and order.</p>

      <div style={{ marginTop: 20, maxWidth: 420 }}>
        <input
          className="input"
          placeholder="Search shops…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="page-loader">Loading shops…</div>
      ) : filtered.length === 0 ? (
        <div className="glass empty" style={{ marginTop: 28 }}>
          {shops.length === 0 ? 'No shops are open for ordering yet.' : 'No shops match your search.'}
        </div>
      ) : (
        <div className="shop-grid" style={{ marginTop: 26 }}>
          {filtered.map((shop) => (
            <ShopCard key={shop._id} shop={shop} />
          ))}
        </div>
      )}
    </div>
  );
}
