import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true, index: true }, // normalized email or phone
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL cleanup
  },
  { timestamps: true }
);

export default mongoose.models.Otp || mongoose.model('Otp', otpSchema);
