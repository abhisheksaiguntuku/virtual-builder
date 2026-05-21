import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  phoneNumber: { type: String, unique: true },
  googleId: { type: String, sparse: true, unique: true },
  email: { type: String, sparse: true },
  photo: String,
  city: { type: String, default: 'Not specified' },
  name: String,
  createdAt: { type: Date, default: Date.now }
});

const PlotSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  length: Number,
  width: Number,
  facing: String,
  budget: Number,
  city: String,
  tier: { type: String, enum: ['Budget', 'Standard', 'Premium'], default: 'Standard' },
  formData: { type: mongoose.Schema.Types.Mixed }, // Stores wizard form answers
  apiData: { type: mongoose.Schema.Types.Mixed },  // Stores calculated BOM and vendors
  milestones: [{
    id: String,
    title: String,
    description: String,
    completed: { type: Boolean, default: false },
    completedAt: { type: Date }
  }],
  createdAt: { type: Date, default: Date.now }
});

const SupplierSchema = new mongoose.Schema({
  name: String,
  city: String,
  hubCity: String, // E.g. Vizianagaram maps to Visakhapatnam
  type: String, // 'Cement', 'Civil Contractor', etc
  contact: String,
  rating: Number,
  isWholesale: Boolean,
  discountText: String
});

export const User = mongoose.model('User', UserSchema);
export const Plot = mongoose.model('Plot', PlotSchema);
export const Supplier = mongoose.model('Supplier', SupplierSchema);
