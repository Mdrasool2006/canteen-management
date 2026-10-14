import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../api/client.js';
import ShopProfileForm from '../../components/seller/ShopProfileForm.jsx';
import MenuManager from '../../components/seller/MenuManager.jsx';
import OrdersBoard from '../../components/seller/OrdersBoard.jsx';

const TABS = [
  { id: 'orders', label: '🧾 Live orders' },
  { id: 'menu', label: '🍱 Menu' },
  { id: 'shop', label: '🏪 Shop profile' },
];

export default function SellerDashboard() {
  const [tab, setTab] = useState('orders');
  const [shop, setShop] = useState(undefined); // undefined = loading, null = not created yet

  useEffect(() => {
    api
      .get('/shops/mine')
      .then(({ data }) => setShop(data))
      .catch((err) => {
        toast.error(getErrorMessage(err));
        setShop(null);
      });
  }, []);

  if (shop === undefined) return <div className="page-loader">Loading dashboard…</div>;

  // First-time sellers create their shop profile before anything else
  if (shop === null) {
    return (
      <div className="page">
        <h1 className="page-title">Set up your shop</h1>
        <p className="muted">Create your shop profile to start adding menu items and receiving orders.</p>
        <div className="glass section-card" style={{ marginTop: 22, maxWidth: 640 }}>
          <ShopProfileForm shop={null} onSaved={setShop} />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="row-between">
        <div>
          <h1 className="page-title">{shop.name}</h1>
          <p className="muted">Seller dashboard</p>
        </div>
        <span className={`pill ${shop.isOpen ? 'pill-green' : 'pill-red'}`}>
          {shop.isOpen ? 'Accepting orders' : 'Shop closed'}
        </span>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'orders' && <OrdersBoard />}
      {tab === 'menu' && <MenuManager />}
      {tab === 'shop' && (
        <div className="glass section-card" style={{ maxWidth: 680 }}>
          <ShopProfileForm shop={shop} onSaved={setShop} />
        </div>
      )}
    </div>
  );
}
