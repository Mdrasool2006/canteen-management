import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../api/client.js';
import {
  formatDate,
  formatINR,
  ORDER_STATUS_CLASS,
  ORDER_STATUS_LABEL,
} from '../../utils/format.js';

// Which status changes the seller can make from each state
const NEXT_ACTIONS = {
  pending: [
    { status: 'preparing', label: 'Start preparing', cls: 'btn-primary' },
    { status: 'cancelled', label: 'Decline', cls: 'btn-danger' },
  ],
  preparing: [{ status: 'ready', label: 'Mark ready', cls: 'btn-success' }],
  ready: [{ status: 'completed', label: 'Complete order', cls: 'btn-primary' }],
};

export default function OrdersBoard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    api
      .get('/orders/shop')
      .then(({ data }) => setOrders(data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  // Poll so new orders show up without a manual refresh
  useEffect(() => {
    load();
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, [load]);

  const changeStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.success(`Order ${ORDER_STATUS_LABEL[status].toLowerCase()}`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <div className="page-loader">Loading orders…</div>;
  if (orders.length === 0) return <div className="glass empty">No orders yet. New orders appear here automatically.</div>;

  // Active orders first, then finished ones
  const sorted = [...orders].sort((a, b) => {
    const done = (o) => ['completed', 'cancelled'].includes(o.status);
    return done(a) - done(b) || new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="menu-grid">
      {sorted.map((order) => (
        <div className="glass order-card" key={order._id}>
          <div className="row-between">
            <div>
              <strong>{order.customer?.name || 'Customer'}</strong>
              <div className="muted">{order.customer?.phone || order.customer?.email}</div>
            </div>
            <span className={`pill ${ORDER_STATUS_CLASS[order.status]}`}>{ORDER_STATUS_LABEL[order.status]}</span>
          </div>

          <div className="order-items">
            {order.items.map((it, i) => (
              <span key={i}>{it.quantity} × {it.name}</span>
            ))}
            {order.note && <span>📝 {order.note}</span>}
          </div>

          <div className="row-between">
            <span className="muted">{formatDate(order.createdAt)}</span>
            <strong className="price">{formatINR(order.total)}</strong>
          </div>

          {NEXT_ACTIONS[order.status] && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {NEXT_ACTIONS[order.status].map((action) => (
                <button
                  key={action.status}
                  className={`btn btn-sm ${action.cls}`}
                  onClick={() => changeStatus(order._id, action.status)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
