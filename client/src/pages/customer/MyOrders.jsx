import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../api/client.js';
import {
  formatDate,
  formatINR,
  ORDER_STATUS_CLASS,
  ORDER_STATUS_LABEL,
} from '../../utils/format.js';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    api
      .get('/orders/my')
      .then(({ data }) => setOrders(data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  // Load once, then refresh every 20 seconds so status updates from the kitchen appear
  useEffect(() => {
    load();
    const timer = setInterval(load, 20000);
    return () => clearInterval(timer);
  }, [load]);

  return (
    <div className="page">
      <div className="row-between">
        <div>
          <h1 className="page-title">My orders</h1>
          <p className="muted">Live status updates from the canteen appear here automatically.</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load}>Refresh</button>
      </div>

      {loading ? (
        <div className="page-loader">Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="glass empty" style={{ marginTop: 24 }}>You haven't placed any orders yet.</div>
      ) : (
        <div className="table-like" style={{ marginTop: 24 }}>
          {orders.map((order) => (
            <div className="glass order-card" key={order._id}>
              <div className="row-between">
                <div>
                  <h3>{order.shop?.name || 'Shop'}</h3>
                  <span className="muted">{formatDate(order.createdAt)}</span>
                </div>
                <span className={`pill ${ORDER_STATUS_CLASS[order.status]}`}>
                  {ORDER_STATUS_LABEL[order.status]}
                </span>
              </div>

              <div className="order-items">
                {order.items.map((it, i) => (
                  <span key={i}>{it.quantity} × {it.name} — {formatINR(it.price * it.quantity)}</span>
                ))}
                {order.note && <span>📝 {order.note}</span>}
              </div>

              <div className="row-between">
                <span className="muted">Total</span>
                <strong className="price">{formatINR(order.total)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
