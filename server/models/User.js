import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, lowercase: true, trim: true, unique: true, sparse: true },
    phone: { type: String, trim: true, unique: true, sparse: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', 'seller'], required: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.methods.toSafe = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    isVerified: this.isVerified,
  };
};

export default mongoose.models.User || mongoose.model('User', userSchema);
