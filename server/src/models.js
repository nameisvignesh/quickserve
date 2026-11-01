import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  clerkId: { type: String, unique: true, sparse: true, index: true },
  phone: { type: String, trim: true, index: true },
  phoneVerified: { type: Boolean, default: false },
  otpHash: String,
  otpExpiresAt: Date,
  photoProof: String,
  signatureProof: String,
  role: { type: String, enum: ["customer", "professional", "employee", "admin"], default: "customer" }
}, { timestamps: true });

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: String,
  price: { type: Number, required: true, min: 0 },
  duration: { type: String, default: "60–90 min" },
  icon: { type: String, default: "✦" },
  options: [{
    _id: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true, min: 0 },
    duration: String,
    includes: [String]
  }],
  active: { type: Boolean, default: true }
}, { timestamps: true });

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{ service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" }, optionId: String, name: String, price: Number, duration: String }],
  address: { type: String, required: true },
  area: String,
  pincode: String,
  scheduledAt: { type: Date, required: true },
  notes: String,
  subtotal: Number,
  tax: Number,
  total: Number,
  status: { type: String, enum: ["pending_payment", "confirmed", "assigned", "arrived", "in_progress", "completed", "cancelled"], default: "pending_payment" },
  paymentStatus: { type: String, enum: ["unpaid", "demo_paid", "paid", "failed", "refunded"], default: "unpaid" },
  paymentOrderId: String,
  paymentId: String,
  ticketId: { type: String, unique: true, sparse: true },
  confirmedAt: Date,
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  acceptedAt: Date
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
export const Service = mongoose.model("Service", serviceSchema);
export const Booking = mongoose.model("Booking", bookingSchema);
