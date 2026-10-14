import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, default: '', maxlength: 500 },
    image: { type: String, default: '' },
    isOpen: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Shop || mongoose.model('Shop', shopSchema);
