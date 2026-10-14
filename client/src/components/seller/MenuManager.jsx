import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../api/client.js';
import { formatINR } from '../../utils/format.js';

const EMPTY = { name: '', description: '', price: '', category: '', isAvailable: true };

export default function MenuManager() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () =>
    api
      .get('/menu/mine')
      .then(({ data }) => setItems(data))
      .catch((err) => toast.error(getErrorMessage(err)));

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(EMPTY);
    setFile(null);
    setPreview('');
    setEditingId(null);
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      isAvailable: item.isAvailable,
    });
    setFile(null);
    setPreview(item.image || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFile = (e) => {
    const picked = e.target.files[0];
    if (!picked) return;
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => fd.append(key, String(value)));
      if (file) fd.append('image', file);

      if (editingId) await api.put(`/menu/${editingId}`, fd);
      else await api.post('/menu', fd);

      toast.success(editingId ? 'Item updated' : 'Item added');
      resetForm();
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const toggleAvailable = async (item) => {
    try {
      await api.put(`/menu/${item._id}`, { isAvailable: !item.isAvailable });
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const removeItem = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      await api.delete(`/menu/${item._id}`);
      toast.success('Item deleted');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="stack" style={{ gap: 22 }}>
      <form className="glass section-card" onSubmit={handleSubmit}>
        <h3 style={{ marginBottom: 16 }}>{editingId ? 'Edit menu item' : 'Add a menu item'}</h3>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="item-name">Name</label>
            <input id="item-name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={80} />
          </div>
          <div className="field">
            <label htmlFor="item-price">Price (₹)</label>
            <input id="item-price" type="number" min="0" step="0.01" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          </div>
          <div className="field">
            <label htmlFor="item-cat">Category</label>
            <input id="item-cat" className="input" placeholder="e.g. Snacks, Meals, Drinks" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} maxLength={40} />
          </div>
          <div className="field">
            <label htmlFor="item-desc">Description</label>
            <input id="item-desc" className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={300} />
          </div>
        </div>

        <div className="field" style={{ marginTop: 14 }}>
          <label>Item photo</label>
          <div className="upload-box">
            {preview ? <img src={preview} alt="Preview" /> : <span className="muted">Add a photo (max 3MB)</span>}
            <input type="file" accept="image/*" onChange={handleFile} />
          </div>
        </div>

        <div className="row-between" style={{ marginTop: 18 }}>
          <label className="checkbox">
            <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} />
            Available for ordering
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
            )}
            <button className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving…' : editingId ? 'Update item' : 'Add item'}
            </button>
          </div>
        </div>
      </form>

      <div className="table-like">
        {items.length === 0 && <div className="glass empty">No menu items yet. Add your first dish above.</div>}

        {items.map((item) => (
          <div className="menu-admin-row glass" key={item._id} style={{ padding: 14 }}>
            <div className="thumb">{item.image ? <img src={item.image} alt={item.name} /> : '🍽️'}</div>

            <div style={{ flex: 1, minWidth: 180 }}>
              <strong>{item.name}</strong>
              <div className="muted">{item.category} · {item.description || 'No description'}</div>
              <span className="price">{formatINR(item.price)}</span>
            </div>

            <span className={`pill ${item.isAvailable ? 'pill-green' : 'pill-gray'}`}>
              {item.isAvailable ? 'Available' : 'Hidden'}
            </span>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => toggleAvailable(item)}>
                {item.isAvailable ? 'Hide' : 'Show'}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => startEdit(item)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => removeItem(item)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
