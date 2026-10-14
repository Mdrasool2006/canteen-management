import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, default: '', maxlength: 300 },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, default: 'General', trim: true, maxlength: 40 },
    image: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);
