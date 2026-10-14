import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../api/client.js';
import { formatINR } from '../../utils/format.js';

export default function ShopMenu() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState({}); // { [menuItemId]: { item, qty } }
  const [note, setNote] = useState('');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    api
      .get(`/shops/${id}`)
      .then(({ data }) => setData(data))
      .catch((err) => toast.error(getErrorMessage(err)));
  }, [id]);

  const categories = useMemo(
    () => ['All', ...new Set((data?.menu || []).map((m) => m.category))],
    [data]
  );

  if (!data) return <div className="page-loader">Loading shop…</div>;

  const { shop, menu } = data;
  const visible = menu.filter((m) => category === 'All' || m.category === category);
  const cartItems = Object.values(cart);
  const total = cartItems.reduce((sum, { item, qty }) => sum + item.price * qty, 0);
  const count = cartItems.reduce((sum, { qty }) => sum + qty, 0);

  const changeQty = (item, delta) =>
    setCart((prev) => {
      const next = { ...prev };
      const qty = (prev[item._id]?.qty || 0) + delta;
      if (qty <= 0) delete next[item._id];
      else next[item._id] = { item, qty: Math.min(qty, 20) };
      return next;
    });

  const placeOrder = async () => {
    setPlacing(true);
    try {
      await api.post('/orders', {
        shopId: shop._id,
        note,
        items: cartItems.map(({ item, qty }) => ({ menuItemId: item._id, quantity: qty })),
      });
      toast.success('Order placed! 🎉');
      navigate('/customer/orders');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="page">
      <div className="glass shop-head">
        <div className="thumb lg">{shop.image ? <img src={shop.image} alt="" /> : '🍴'}</div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 className="page-title">{shop.name}</h1>
          <p className="muted">{shop.description || 'Freshly prepared meals'}</p>
          <span className={`pill ${shop.isOpen ? 'pill-green' : 'pill-red'}`} style={{ marginTop: 8 }}>
            {shop.isOpen ? 'Open now' : 'Closed right now'}
          </span>
        </div>
      </div>

      <div className="chips">
        {categories.map((c) => (
          <button key={c} className={`chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="split">
        <div className="menu-grid">
          {visible.length === 0 && <div className="glass empty">No items in this category.</div>}

          {visible.map((item) => {
            const qty = cart[item._id]?.qty || 0;
            return (
              <div key={item._id} className="glass menu-card">
                <div className="menu-img">
                  {item.image ? <img src={item.image} alt={item.name} /> : '🍽️'}
                </div>
                <div className="row-between">
                  <h4>{item.name}</h4>
                  <span className="price">{formatINR(item.price)}</span>
                </div>
                <p className="muted">{item.description || item.category}</p>

                {qty === 0 ? (
                  <button className="btn btn-primary btn-sm" disabled={!shop.isOpen} onClick={() => changeQty(item, 1)}>
                    Add to cart
                  </button>
                ) : (
                  <div className="qty">
                    <button onClick={() => changeQty(item, -1)}>−</button>
                    <strong>{qty}</strong>
                    <button onClick={() => changeQty(item, 1)}>+</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <aside className="glass cart">
          <h3>Your cart</h3>

          {cartItems.length === 0 ? (
            <p className="muted" style={{ marginTop: 10 }}>Your cart is empty. Add something tasty!</p>
          ) : (
            <>
              <div style={{ marginTop: 10 }}>
                {cartItems.map(({ item, qty }) => (
                  <div className="cart-line" key={item._id}>
                    <span>{item.name} × {qty}</span>
                    <span>{formatINR(item.price * qty)}</span>
                  </div>
                ))}
              </div>

              <div className="field" style={{ marginTop: 14 }}>
                <label htmlFor="note">Note for the kitchen (optional)</label>
                <input id="note" className="input" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
              </div>

              <div className="row-between" style={{ marginTop: 16 }}>
                <strong>Total</strong>
                <strong className="price">{formatINR(total)}</strong>
              </div>

              <button
                className="btn btn-primary btn-block"
                style={{ marginTop: 14 }}
                disabled={placing || !shop.isOpen}
                onClick={placeOrder}
              >
                {placing ? 'Placing order…' : `Place order (${count})`}
              </button>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
