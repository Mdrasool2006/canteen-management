export const formatINR = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

export const ORDER_STATUS_LABEL = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready: 'Ready for pickup',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_CLASS = {
  pending: 'pill-amber',
  preparing: 'pill-blue',
  ready: 'pill-green',
  completed: 'pill-gray',
  cancelled: 'pill-red',
};

export const formatDate = (iso) =>
  new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
