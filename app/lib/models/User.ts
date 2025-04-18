import mongoose, { Document } from 'mongoose';

interface IUser extends Document {
  walletAddress: string;
  createdAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
  walletAddress: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
  strict: true, // Only allow fields defined in schema
  strictQuery: true,
});

// Create indexes
UserSchema.index({ walletAddress: 1 }, { unique: true });

// Pre-save hook to ensure required fields
UserSchema.pre('save', function(next) {
  if (!this.walletAddress) {
    next(new Error('Wallet address is required'));
  }
  next();
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);