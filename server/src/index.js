import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import crypto from "crypto";
import { Server } from "socket.io";
import http from "http";
import { User, Service, Booking } from "./models.js";
import { requireAuth, requireRole } from "./auth.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL || "http://localhost:5173" } });
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
const port = process.env.PORT || 5000;
const taxRate = 0.05;

function tokenFor(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
}
function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}
function razorpayClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}

app.get("/api/health", (_req, res) => res.json({ status: "ok", app: "QuickServe", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" }));

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 8) return res.status(400).json({ message: "Enter name, email, and a password of at least 8 characters." });
    if (await User.findOne({ email: email.toLowerCase().trim() })) return res.status(409).json({ message: "An account with this email already exists." });
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
  } catch (e) { res.status(500).json({ message: "Could not create account.", detail: e.message }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: String(req.body.email || "").toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(req.body.password || "", user.passwordHash))) return res.status(401).json({ message: "Email or password is incorrect." });
    res.json({ token: tokenFor(user), user: publicUser(user) });
  } catch (e) { res.status(500).json({ message: "Could not log in.", detail: e.message }); }
});

app.get("/api/services", async (_req, res) => {
  try { res.json(await Service.find({ active: true }).sort({ category: 1, name: 1 })); }
  catch (e) { res.status(500).json({ message: "Could not load services.", detail: e.message }); }
});

app.post("/api/bookings", requireAuth, async (req, res) => {
  try {
    const { serviceIds, address, area, pincode, scheduledAt, notes } = req.body;
    if (!Array.isArray(serviceIds) || !serviceIds.length || !address?.trim() || !scheduledAt) return res.status(400).json({ message: "Choose at least one service, enter an address, and select a date/time." });
    const services = await Service.find({ _id: { $in: serviceIds }, active: true });
    if (services.length !== new Set(serviceIds).size) return res.status(400).json({ message: "One or more selected services are unavailable." });
    const subtotal = services.reduce((sum, s) => sum + s.price, 0);
    const tax = Math.round(subtotal * taxRate);
    const booking = await Booking.create({
      customer: req.user.id,
      items: services.map(s => ({ service: s._id, name: s.name, price: s.price })),
      address: address.trim(), area: area || "", pincode: pincode || "", scheduledAt: new Date(scheduledAt), notes: notes || "",
      subtotal, tax, total: subtotal + tax, status: "pending_payment", paymentStatus: "unpaid"
    });
    io.emit("booking:created", { bookingId: booking._id.toString(), status: booking.status });
    res.status(201).json(booking);
  } catch (e) { res.status(500).json({ message: "Could not create booking.", detail: e.message }); }
});

app.get("/api/bookings/mine", requireAuth, async (req, res) => {
  const bookings = await Booking.find({ customer: req.user.id }).sort({ createdAt: -1 });
  res.json(bookings);
});

app.post("/api/payments/order", requireAuth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.body.bookingId, customer: req.user.id });
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    if (booking.paymentStatus === "paid" || booking.paymentStatus === "demo_paid") return res.status(409).json({ message: "This booking is already paid." });
    const razorpay = razorpayClient();
    if (!razorpay) return res.json({ mode: "demo", bookingId: booking._id, amount: booking.total * 100, currency: "INR", message: "Razorpay keys are not configured. Demo checkout only." });
    const order = await razorpay.orders.create({ amount: booking.total * 100, currency: "INR", receipt: String(booking._id) });
    booking.paymentOrderId = order.id;
    await booking.save();
    res.json({ mode: "razorpay", keyId: process.env.RAZORPAY_KEY_ID, orderId: order.id, amount: order.amount, currency: order.currency, bookingId: booking._id });
  } catch (e) { res.status(500).json({ message: "Could not create payment order.", detail: e.message }); }
});

app.post("/api/payments/demo-confirm", requireAuth, async (req, res) => {
  const booking = await Booking.findOne({ _id: req.body.bookingId, customer: req.user.id });
  if (!booking) return res.status(404).json({ message: "Booking not found." });
  if (razorpayClient()) return res.status(400).json({ message: "Demo confirmation is disabled when Razorpay keys are configured." });
  booking.paymentStatus = "demo_paid";
  booking.status = "confirmed";
  await booking.save();
  io.emit("booking:updated", { bookingId: booking._id.toString(), status: booking.status, paymentStatus: booking.paymentStatus });
  res.json({ booking, message: "Demo payment recorded. No money was charged." });
});

app.post("/api/payments/verify", requireAuth, async (req, res) => {
  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const booking = await Booking.findOne({ _id: bookingId, customer: req.user.id });
    if (!booking || booking.paymentOrderId !== razorpay_order_id) return res.status(400).json({ message: "Payment order does not match this booking." });
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "").update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    if (!process.env.RAZORPAY_KEY_SECRET || expected !== razorpay_signature) {
      booking.paymentStatus = "failed"; await booking.save();
      return res.status(400).json({ message: "Payment verification failed." });
    }
    booking.paymentStatus = "paid"; booking.paymentId = razorpay_payment_id; booking.status = "confirmed";
    await booking.save();
    io.emit("booking:updated", { bookingId: booking._id.toString(), status: booking.status, paymentStatus: booking.paymentStatus });
    res.json({ booking, message: "Payment verified." });
  } catch (e) { res.status(500).json({ message: "Could not verify payment.", detail: e.message }); }
});

app.get("/api/admin/bookings", requireAuth, requireRole("admin"), async (_req, res) => {
  const bookings = await Booking.find().populate("customer", "name email").sort({ createdAt: -1 });
  res.json(bookings);
});
app.patch("/api/admin/bookings/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
  const allowed = ["confirmed", "assigned", "in_progress", "completed", "cancelled"];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid booking status." });
  const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!booking) return res.status(404).json({ message: "Booking not found." });
  io.emit("booking:updated", { bookingId: booking._id.toString(), status: booking.status, paymentStatus: booking.paymentStatus });
  res.json(booking);
});
app.post("/api/admin/services", requireAuth, requireRole("admin"), async (req, res) => {
  const { name, category, price, description, duration, icon } = req.body;
  if (!name || !category || !Number.isFinite(Number(price)) || Number(price) < 0) return res.status(400).json({ message: "Name, category, and valid price are required." });
  const service = await Service.create({ name, category, price: Number(price), description, duration, icon });
  res.status(201).json(service);
});
app.patch("/api/admin/services/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!service) return res.status(404).json({ message: "Service not found." });
  res.json(service);
});

io.on("connection", socket => socket.emit("quickserve:connected", { connected: true }));
app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ message: "Unexpected server error." }); });

mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/quickserve")
  .then(() => server.listen(port, () => console.log(`QuickServe API listening on http://localhost:${port}`)))
  .catch(err => { console.error("MongoDB connection failed:", err.message); process.exit(1); });
