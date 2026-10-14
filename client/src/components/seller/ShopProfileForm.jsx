import { useState } from 'react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../api/client.js';

export default function ShopProfileForm({ shop, onSaved }) {
  const [name, setName] = useState(shop?.name || '');
  const [description, setDescription] = useState(shop?.description || '');
  const [isOpen, setIsOpen] = useState(shop?.isOpen ?? true);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(shop?.image || '');
  const [busy, setBusy] = useState(false);

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
      fd.append('name', name);
      fd.append('description', description);
      fd.append('isOpen', String(isOpen));
      if (file) fd.append('image', file);

      const { data } = await api.put('/shops/mine', fd);
      toast.success('Shop profile saved');
      onSaved(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="shop-name">Shop name</label>
        <input id="shop-name" className="input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
      </div>

      <div className="field">
        <label htmlFor="shop-desc">Description</label>
        <textarea id="shop-desc" className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
      </div>

      <div className="field">
        <label>Shop cover image</label>
        <div className="upload-box">
          {preview ? <img src={preview} alt="Shop preview" /> : <span className="muted">No image yet</span>}
          <input type="file" accept="image/*" onChange={handleFile} />
        </div>
      </div>

      <label className="checkbox">
        <input type="checkbox" checked={isOpen} onChange={(e) => setIsOpen(e.target.checked)} />
        Currently accepting orders
      </label>

      <button className="btn btn-primary" disabled={busy}>
        {busy ? 'Saving…' : shop ? 'Save changes' : 'Create shop'}
      </button>
    </form>
  );
}
