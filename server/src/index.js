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
import { verifyToken } from "@clerk/backend";
import { User, Service, Booking } from "./models.js";
import { defaultServices, seededServices } from "./catalog.js";
import { requireAuth, requireRole, requireOwner, ownerEmail } from "./auth.js";
import { createSqliteStore } from "./sqlite.js";

const app = express();
const server = http.createServer(app);
const clientOrigin = process.env.CLIENT_URL || "http://localhost:5173";
const io = new Server(server, { cors: { origin: clientOrigin } });
const port = Number(process.env.PORT || 5000);
const taxRate = 0.05;
const jwtSecret = process.env.JWT_SECRET || "quickserve-local-development-secret";
const ownerPassword = process.env.OWNER_PASSWORD || "quickserveadmin2026";
const quickserveUpiId = process.env.QUICKSERVE_UPI_ID || "quickserve@upi";
const upiWebhookSecret = process.env.UPI_WEBHOOK_SECRET || "";
const clerkSecretKey = process.env.CLERK_SECRET_KEY || "";
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || "";
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || "";
const twilioFromNumber = process.env.TWILIO_FROM_NUMBER || "";
const localOtpMode = process.env.LOCAL_OTP_MODE !== "false" && process.env.NODE_ENV !== "production";
const localOtpCode = String(process.env.LOCAL_OTP_CODE || "123456").replace(/\D/g, "").slice(0, 6) || "123456";

// The app is useful immediately after checkout, even when MongoDB is not installed.
// MongoDB becomes the persistence layer automatically when it is available.
let storageMode = "memory";
const sqliteStore = createSqliteStore();
const memory = { users: sqliteStore.loadUsers(), services: seededServices(), bookings: [] };

app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: "1mb" }));

function tokenFor(user) {
  return jwt.sign(
    { id: String(user._id), role: user.role, name: user.name, email: user.email },
    jwtSecret,
    { expiresIn: "7d" }
  );
}

function persistUser(user) {
  sqliteStore.saveUser(user);
}

function publicUser(user) {
  return { id: String(user._id), name: user.name, email: user.email, phone: user.phone || "", role: user.role, photoProof: user.photoProof || "" };
}

function razorpayClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
}

function smsConfigured() {
  return Boolean(twilioAccountSid && twilioAuthToken && twilioFromNumber);
}

function localOtpConfigured() {
  return !smsConfigured() && localOtpMode;
}

async function sendSmsOtp(phone, purpose) {
  if (!smsConfigured()) throw new Error("SMS provider is not configured.");
  const otp = String(crypto.randomInt(100000, 1_000_000));
  const destination = phone.startsWith("+") ? phone : `+91${phone}`;
  const body = new URLSearchParams({ To: destination, From: twilioFromNumber, Body: `QuickServe ${purpose} OTP: ${otp}. It expires in 5 minutes. Do not share this code.` });
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, { method: "POST", headers: { Authorization: `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" }, body });
  if (!response.ok) throw new Error("SMS provider rejected the OTP request.");
  return otp;
}

async function issueOtp(phone, purpose) {
  if (smsConfigured()) return { otp: await sendSmsOtp(phone, purpose), local: false };
  if (localOtpConfigured()) return { otp: localOtpCode, local: true };
  throw new Error("SMS provider is not configured.");
}

function newId() {
  return crypto.randomUUID();
}

function findMemoryBooking(id, customerId) {
  return memory.bookings.find((booking) => String(booking._id) === String(id) && (!customerId || String(booking.customer) === String(customerId)));
}

function isValidDate(value) {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() > Date.now() - 60_000;
}

function newTicketId() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `QS-${stamp}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

function isTestFixture(booking, customer = null) {
  const address = String(booking?.address || "");
  const name = String(customer?.name || booking?.customer?.name || "");
  const phone = String(customer?.phone || booking?.customer?.phone || "");
  return /test street|tamil customer/i.test(`${address} ${name}`) || phone === "9000087325";
}

function isVisibleTicket(booking, customer = null) {
  return Boolean(booking?.ticketId) && ["paid", "demo_paid"].includes(booking?.paymentStatus) && !isTestFixture(booking, customer);
}

function confirmBooking(booking, paymentStatus) {
  booking.paymentStatus = paymentStatus;
  booking.status = "confirmed";
  booking.ticketId ||= newTicketId();
  booking.confirmedAt ||= new Date();
  booking.updatedAt = new Date();
}

async function clerkIdentity(req) {
  if (!clerkSecretKey) return null;
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  try {
    return await verifyToken(token, { secretKey: clerkSecretKey, authorizedParties: [clientOrigin] });
  } catch {
    return null;
  }
}

async function seedMongoIfEmpty() {
  for (const service of defaultServices) await Service.updateOne({ name: service.name }, { $set: service }, { upsert: true });
}

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "QuickServe",
    database: storageMode === "mongo" ? "connected" : "sqlite-local",
    services: storageMode === "mongo" ? undefined : memory.services.length
  });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");
    const phone = normalizePhone(req.body.phone);
    if (name.length < 2 || name.length > 80 || !email || !/^\S+@\S+\.\S+$/.test(email) || !/^\d{10}$/.test(phone) || password.length < 8) {
      return res.status(400).json({ message: "Enter a valid name, 10-digit phone number, email, and a password of at least 8 characters." });
    }
    if (email === ownerEmail && password !== ownerPassword) return res.status(403).json({ message: "That owner email can only be registered with the configured owner password." });
    const role = email === ownerEmail ? "admin" : "customer";

    if (storageMode === "memory" && memory.users.some((user) => user.email === email || user.phone === phone)) return res.status(409).json({ message: "An account with this email or phone already exists." });
    if (storageMode === "mongo" && await User.findOne({ $or: [{ email }, { phone }] })) return res.status(409).json({ message: "An account with this email or phone already exists." });
    if (role === "admin") {
      const user = storageMode === "memory"
        ? { _id: newId(), name, email, phone, phoneVerified: true, passwordHash: await bcrypt.hash(password, 12), role, createdAt: new Date(), updatedAt: new Date() }
        : await User.create({ name, email, phone, phoneVerified: true, role, passwordHash: await bcrypt.hash(password, 12) });
      if (storageMode === "memory") memory.users.push(user);
      persistUser(user);
      return res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
    }
    let issued;
    try { issued = await issueOtp(phone, "account creation"); } catch { return res.status(503).json({ message: "Phone verification is unavailable until the SMS provider is configured." }); }
    const otp = issued.otp;
    const values = { name, email, phone, phoneVerified: false, otpHash: await bcrypt.hash(otp, 10), otpExpiresAt: new Date(Date.now() + 5 * 60_000), passwordHash: await bcrypt.hash(password, 12), role };
    const user = storageMode === "memory" ? { _id: newId(), ...values, createdAt: new Date(), updatedAt: new Date() } : await User.create(values);
    if (storageMode === "memory") memory.users.push(user);
    persistUser(user);
    const response = { pending: true, pendingId: String(user._id), message: issued.local ? "Local development OTP created. Verify it to finish creating your account." : "OTP sent to your mobile number. Verify it to finish creating your account.", expiresIn: 300 };
    if (issued.local) response.devOtp = issued.otp;
    return res.status(201).json(response);
  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(500).json({ message: "Could not create account." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");
    let user = storageMode === "memory"
      ? memory.users.find((candidate) => candidate.email === email)
      : await User.findOne({ email });
    if (!user && email === ownerEmail && password === ownerPassword) {
      user = storageMode === "memory"
        ? { _id: newId(), name: "QuickServe Owner", email, phone: "0000000000", passwordHash: await bcrypt.hash(password, 12), role: "admin", createdAt: new Date(), updatedAt: new Date() }
        : await User.create({ name: "QuickServe Owner", email, phone: "0000000000", passwordHash: await bcrypt.hash(password, 12), role: "admin" });
      if (storageMode === "memory") memory.users.push(user);
      persistUser(user);
    }
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: "Email or password is incorrect." });
    if (user.role !== "admin" && user.phone && !user.phoneVerified) return res.status(403).json({ message: "Verify your mobile number with OTP before signing in." });
    return res.json({ token: tokenFor(user), user: publicUser(user) });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Could not log in." });
  }
});

app.post("/api/auth/request-otp", async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    if (!/^\d{10}$/.test(phone)) return res.status(400).json({ message: "Enter a valid 10-digit phone number." });
    const user = storageMode === "memory" ? memory.users.find((candidate) => candidate.phone === phone) : await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: "No QuickServe account is linked to this phone number." });
    let issued;
    try { issued = await issueOtp(phone, "sign in"); } catch { return res.status(503).json({ message: "Phone verification is unavailable until the SMS provider is configured." }); }
    const otp = issued.otp;
    user.otpHash = await bcrypt.hash(otp, 10);
    user.otpExpiresAt = new Date(Date.now() + 5 * 60_000);
    if (storageMode === "mongo") await user.save();
    else persistUser(user);
    const response = { message: issued.local ? "Local development OTP created. Verify it to continue." : "OTP sent to your mobile number. Verify it to continue.", expiresIn: 300 };
    if (issued.local) response.devOtp = issued.otp;
    return res.json(response);
  } catch (error) {
    console.error("OTP request error:", error.message);
    return res.status(500).json({ message: "Could not generate an OTP." });
  }
});

app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const otp = String(req.body.otp || "");
    const user = storageMode === "memory" ? memory.users.find((candidate) => candidate.phone === phone) : await User.findOne({ phone });
    if (!user || !user.otpHash || !user.otpExpiresAt || new Date(user.otpExpiresAt).getTime() < Date.now() || !(await bcrypt.compare(otp, user.otpHash))) return res.status(401).json({ message: "That OTP is invalid or expired." });
    user.phoneVerified = true;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    if (storageMode === "mongo") await user.save();
    else persistUser(user);
    return res.json({ token: tokenFor(user), user: publicUser(user) });
  } catch (error) {
    console.error("OTP verification error:", error.message);
    return res.status(500).json({ message: "Could not verify the OTP." });
  }
});

app.post("/api/auth/register-verify", async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const otp = String(req.body.otp || "");
    const pendingId = String(req.body.pendingId || "");
    const user = storageMode === "memory"
      ? memory.users.find((candidate) => String(candidate._id) === pendingId && candidate.phone === phone)
      : await User.findOne({ _id: pendingId, phone });
    if (!user || user.role !== "customer" || user.phoneVerified || !user.otpHash || !user.otpExpiresAt || new Date(user.otpExpiresAt).getTime() < Date.now() || !(await bcrypt.compare(otp, user.otpHash))) return res.status(401).json({ message: "That OTP is invalid or expired." });
    user.phoneVerified = true;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    if (storageMode === "mongo") await user.save();
    else persistUser(user);
    return res.status(201).json({ token: tokenFor(user), user: publicUser(user), message: "Account created and mobile number verified." });
  } catch (error) {
    console.error("Registration OTP verification error:", error.message);
    return res.status(500).json({ message: "Could not verify the account OTP." });
  }
});

app.post("/api/auth/clerk-sync", async (req, res) => {
  try {
    const identity = await clerkIdentity(req);
    if (!identity?.sub) return res.status(401).json({ message: "Clerk session is not configured or is invalid." });
    const name = String(req.body.name || "QuickServe customer").trim().slice(0, 80);
    const email = normalizeEmail(req.body.email);
    const phone = normalizePhone(req.body.phone);
    let user = storageMode === "memory"
      ? memory.users.find((candidate) => candidate.clerkId === identity.sub || (email && candidate.email === email))
      : await User.findOne({ $or: [{ clerkId: identity.sub }, ...(email ? [{ email }] : [])] });
    if (!user) {
      const values = { name, email: email || `${identity.sub}@clerk.local`, phone, clerkId: identity.sub, phoneVerified: Boolean(phone), passwordHash: await bcrypt.hash(newId(), 12), role: "customer" };
      user = storageMode === "memory" ? { _id: newId(), ...values, createdAt: new Date(), updatedAt: new Date() } : await User.create(values);
      if (storageMode === "memory") memory.users.push(user);
      persistUser(user);
    } else {
      user.clerkId = identity.sub;
      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (storageMode === "mongo") await user.save();
      else persistUser(user);
    }
    return res.json({ token: tokenFor(user), user: publicUser(user), provider: "clerk" });
  } catch (error) {
    console.error("Clerk sync error:", error.message);
    return res.status(500).json({ message: "Could not sync the Clerk account." });
  }
});

app.post("/api/employee/register", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = normalizeEmail(req.body.email);
    const phone = normalizePhone(req.body.phone);
    const password = String(req.body.password || "");
    const photoProof = String(req.body.photoProof || "");
    const signatureProof = String(req.body.signatureProof || "");
    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || !/^\d{10}$/.test(phone) || password.length < 8 || !/^data:image\/(png|jpeg|jpg|webp);base64,/.test(photoProof) || !/^data:image\/(png|jpeg|jpg|webp);base64,/.test(signatureProof) || photoProof.length > 1_000_000 || signatureProof.length > 1_000_000) return res.status(400).json({ message: "Name, email, phone, password, photo, and signature are required." });
    const exists = storageMode === "memory" ? memory.users.some((user) => user.email === email || user.phone === phone) : await User.findOne({ $or: [{ email }, { phone }] });
    if (exists) return res.status(409).json({ message: "An account with this email or phone already exists." });
    let issued;
    try { issued = await issueOtp(phone, "employee registration"); } catch { return res.status(503).json({ message: "Phone verification is unavailable until the SMS provider is configured." }); }
    const otp = issued.otp;
    const user = storageMode === "memory"
      ? { _id: newId(), name, email, phone, photoProof, signatureProof, phoneVerified: false, otpHash: await bcrypt.hash(otp, 10), otpExpiresAt: new Date(Date.now() + 5 * 60_000), passwordHash: await bcrypt.hash(password, 12), role: "professional", createdAt: new Date(), updatedAt: new Date() }
      : await User.create({ name, email, phone, photoProof, signatureProof, phoneVerified: false, otpHash: await bcrypt.hash(otp, 10), otpExpiresAt: new Date(Date.now() + 5 * 60_000), passwordHash: await bcrypt.hash(password, 12), role: "professional" });
    if (storageMode === "memory") memory.users.push(user);
    persistUser(user);
    const response = { pending: true, pendingId: String(user._id), message: issued.local ? "Local development OTP created. Verify it to finish employee registration." : "Employee application created. Verify the OTP sent to your mobile number." };
    if (issued.local) response.devOtp = issued.otp;
    return res.status(201).json(response);
  } catch (error) {
    console.error("Employee registration error:", error.message);
    return res.status(500).json({ message: "Could not create employee account." });
  }
});

app.post("/api/employee/verify", async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const otp = String(req.body.otp || "");
    const user = storageMode === "memory" ? memory.users.find((candidate) => String(candidate._id) === String(req.body.pendingId) && candidate.phone === phone) : await User.findOne({ _id: req.body.pendingId, phone });
    if (!user || user.role !== "professional" || !user.otpHash || !user.otpExpiresAt || new Date(user.otpExpiresAt).getTime() < Date.now() || !(await bcrypt.compare(otp, user.otpHash))) return res.status(401).json({ message: "That employee OTP is invalid or expired." });
    user.role = "employee";
    user.phoneVerified = true;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    if (storageMode === "mongo") await user.save();
    else persistUser(user);
    return res.status(201).json({ token: tokenFor(user), user: publicUser(user), message: "Employee account verified." });
  } catch (error) {
    return res.status(500).json({ message: "Could not verify the employee account." });
  }
});

app.post("/api/employee/clerk-onboard", async (req, res) => {
  try {
    const identity = await clerkIdentity(req);
    const photoProof = String(req.body.photoProof || "");
    const signatureProof = String(req.body.signatureProof || "");
    if (!identity?.sub) return res.status(401).json({ message: "Clerk session is not configured or is invalid." });
    if (!/^data:image\/(png|jpeg|jpg|webp);base64,/.test(photoProof) || !/^data:image\/(png|jpeg|jpg|webp);base64,/.test(signatureProof) || photoProof.length > 1_000_000 || signatureProof.length > 1_000_000) return res.status(400).json({ message: "Upload both a profile photo and signature image." });
    const email = normalizeEmail(req.body.email);
    let user = storageMode === "memory" ? memory.users.find((candidate) => candidate.clerkId === identity.sub || candidate.email === email) : await User.findOne({ $or: [{ clerkId: identity.sub }, { email }] });
    if (!user) {
      const values = { _id: newId(), name: String(req.body.name || "QuickServe employee").trim(), email: email || `${identity.sub}@clerk.local`, phone: normalizePhone(req.body.phone), clerkId: identity.sub, photoProof, signatureProof, phoneVerified: true, passwordHash: await bcrypt.hash(newId(), 12), role: "employee", createdAt: new Date(), updatedAt: new Date() };
      user = storageMode === "memory" ? values : await User.create(values);
      if (storageMode === "memory") memory.users.push(user);
      persistUser(user);
    } else {
      user.photoProof = photoProof; user.signatureProof = signatureProof; user.clerkId = identity.sub; user.role = "employee"; user.phoneVerified = true;
      if (storageMode === "mongo") await user.save();
      else persistUser(user);
    }
    return res.json({ token: tokenFor(user), user: publicUser(user), message: "Employee profile verified." });
  } catch (error) {
    console.error("Clerk employee onboarding error:", error.message);
    return res.status(500).json({ message: "Could not complete employee onboarding." });
  }
});

app.post("/api/employee/clerk-sync", async (req, res) => {
  try {
    const identity = await clerkIdentity(req);
    if (!identity?.sub) return res.status(401).json({ message: "Clerk session is not configured or is invalid." });
    const email = normalizeEmail(req.body.email);
    const user = storageMode === "memory"
      ? memory.users.find((candidate) => candidate.clerkId === identity.sub || (email && candidate.email === email && candidate.role === "employee"))
      : await User.findOne({ $or: [{ clerkId: identity.sub }, ...(email ? [{ email, role: "employee" }] : [])] });
    if (!user || user.role !== "employee") return res.status(404).json({ message: "Complete employee onboarding before opening the workspace." });
    user.clerkId = identity.sub;
    if (storageMode === "mongo") await user.save();
    else persistUser(user);
    return res.json({ token: tokenFor(user), user: publicUser(user), provider: "clerk" });
  } catch (error) {
    console.error("Clerk employee sync error:", error.message);
    return res.status(500).json({ message: "Could not sync the Clerk employee account." });
  }
});

app.get("/api/services", async (_req, res) => {
  try {
    const services = storageMode === "memory"
      ? memory.services.filter((service) => service.active).sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
      : await Service.find({ active: true }).sort({ category: 1, name: 1 });
    return res.json(services);
  } catch (error) {
    console.error("Services error:", error.message);
    return res.status(500).json({ message: "Could not load services." });
  }
});

app.post("/api/bookings", requireAuth, async (req, res) => {
  try {
    const { serviceIds, selections, address, area, pincode, scheduledAt, notes } = req.body;
    const requestedSelections = Array.isArray(selections) && selections.length ? selections : (Array.isArray(serviceIds) ? serviceIds.map((serviceId) => ({ serviceId })) : []);
    const ids = [...new Set(requestedSelections.map((item) => String(item.serviceId || item.service || item)))];
    if (!ids.length || ids.length > 8 || !String(address || "").trim() || !isValidDate(scheduledAt)) {
      return res.status(400).json({ message: "Choose at least one service, enter an address, and select a future date/time." });
    }
    if (pincode && !/^\d{6}$/.test(String(pincode))) return res.status(400).json({ message: "Enter a valid 6-digit pincode." });

    let services;
    if (storageMode === "memory") {
      services = memory.services.filter((service) => ids.includes(String(service._id)) && service.active);
    } else {
      if (ids.some((id) => !mongoose.isValidObjectId(id))) return res.status(400).json({ message: "One or more selected services are unavailable." });
      services = await Service.find({ _id: { $in: ids }, active: true });
    }
    if (services.length !== ids.length) return res.status(400).json({ message: "One or more selected services are unavailable." });

    const items = services.map((service) => {
      const selection = requestedSelections.find((item) => String(item.serviceId || item.service || item) === String(service._id));
      const optionId = selection?.optionId ? String(selection.optionId) : "";
      const chosenOption = Array.isArray(service.options) ? service.options.find((item) => item._id === optionId) : null;
      const price = chosenOption ? Number(chosenOption.price) : Number(service.price);
      return { service: service._id, optionId: chosenOption?._id || "", name: chosenOption ? `${service.name} · ${chosenOption.name}` : service.name, price, duration: chosenOption?.duration || service.duration };
    });
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const tax = Math.round(subtotal * taxRate);
    const scheduledDate = new Date(scheduledAt);
    const values = {
      customer: req.user.id,
      items,
      address: String(address).trim(),
      area: String(area || "").trim(),
      pincode: String(pincode || "").trim(),
      scheduledAt: scheduledDate,
      notes: String(notes || "").trim().slice(0, 500),
      subtotal,
      tax,
      total: subtotal + tax,
      status: "pending_payment",
      paymentStatus: "unpaid"
    };

    const booking = storageMode === "memory"
      ? { _id: newId(), ...values, createdAt: new Date(), updatedAt: new Date() }
      : await Booking.create(values);
    if (storageMode === "memory") memory.bookings.unshift(booking);
    io.emit("booking:created", { bookingId: String(booking._id), status: booking.status });
    return res.status(201).json(booking);
  } catch (error) {
    console.error("Booking error:", error.message);
    return res.status(500).json({ message: "Could not create booking." });
  }
});

app.get("/api/bookings/mine", requireAuth, async (req, res) => {
  try {
    const bookings = storageMode === "memory"
      ? memory.bookings.filter((booking) => String(booking.customer) === String(req.user.id))
      : await Booking.find({ customer: req.user.id }).sort({ createdAt: -1 });
    return res.json(bookings);
  } catch (error) {
    console.error("Bookings error:", error.message);
    return res.status(500).json({ message: "Could not load bookings." });
  }
});

async function getCustomerBooking(bookingId, customerId) {
  return storageMode === "memory"
    ? findMemoryBooking(bookingId, customerId)
    : Booking.findOne({ _id: bookingId, customer: customerId });
}

app.post("/api/payments/order", requireAuth, async (req, res) => {
  try {
    const booking = await getCustomerBooking(req.body.bookingId, req.user.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    if (booking.status === "cancelled") return res.status(409).json({ message: "Cancelled bookings cannot be paid." });
    if (["paid", "demo_paid"].includes(booking.paymentStatus)) return res.status(409).json({ message: "This booking is already paid." });

    const razorpay = razorpayClient();
    if (!razorpay) {
      const upiUri = `upi://pay?pa=${encodeURIComponent(quickserveUpiId)}&pn=${encodeURIComponent("QuickServe")}&am=${encodeURIComponent(booking.total)}&cu=INR&tn=${encodeURIComponent(`QuickServe ${booking._id}`)}`;
      return res.json({ mode: "upi", bookingId: booking._id, amount: booking.total * 100, currency: "INR", upiId: quickserveUpiId, upiUri, polling: true, message: "Scan this QR with Google Pay or another UPI app." });
    }
    const order = await razorpay.orders.create({ amount: booking.total * 100, currency: "INR", receipt: String(booking._id) });
    booking.paymentOrderId = order.id;
    if (storageMode === "mongo") await booking.save();
    return res.json({ mode: "razorpay", keyId: process.env.RAZORPAY_KEY_ID, orderId: order.id, amount: order.amount, currency: order.currency, bookingId: booking._id });
  } catch (error) {
    console.error("Payment order error:", error.message);
    return res.status(500).json({ message: "Could not create payment order." });
  }
});

app.post("/api/payments/demo-confirm", requireAuth, async (req, res) => {
  try {
    const booking = await getCustomerBooking(req.body.bookingId, req.user.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    if (razorpayClient()) return res.status(400).json({ message: "Demo confirmation is disabled when Razorpay keys are configured." });
    if (booking.status === "cancelled") return res.status(409).json({ message: "Cancelled bookings cannot be confirmed." });
    confirmBooking(booking, "demo_paid");
    if (storageMode === "mongo") await booking.save();
    io.emit("booking:updated", { bookingId: String(booking._id), status: booking.status, paymentStatus: booking.paymentStatus });
    return res.json({ booking, message: "Demo payment recorded. No money was charged." });
  } catch (error) {
    console.error("Demo payment error:", error.message);
    return res.status(500).json({ message: "Could not confirm demo payment." });
  }
});

app.get("/api/payments/upi/status", requireAuth, async (req, res) => {
  try {
    const booking = await getCustomerBooking(req.query.bookingId, req.user.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    return res.json({ status: ["paid", "demo_paid"].includes(booking.paymentStatus) ? "paid" : "pending", booking });
  } catch (error) {
    return res.status(500).json({ message: "Could not check payment status." });
  }
});

app.post("/api/payments/upi/simulate", requireAuth, async (req, res) => {
  try {
    const booking = await getCustomerBooking(req.body.bookingId, req.user.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    confirmBooking(booking, "demo_paid");
    if (storageMode === "mongo") await booking.save();
    io.emit("booking:updated", { bookingId: String(booking._id), status: booking.status, paymentStatus: booking.paymentStatus, ticketId: booking.ticketId });
    return res.json({ booking, message: "Demo UPI payment received." });
  } catch (error) {
    return res.status(500).json({ message: "Could not complete the demo UPI payment." });
  }
});

app.post("/api/payments/upi/webhook", async (req, res) => {
  try {
    if (upiWebhookSecret) {
      const signature = String(req.headers["x-quickserve-signature"] || "");
      const expected = crypto.createHmac("sha256", upiWebhookSecret).update(JSON.stringify(req.body)).digest("hex");
      if (signature !== expected) return res.status(401).json({ message: "Invalid webhook signature." });
    }
    const booking = storageMode === "memory" ? findMemoryBooking(req.body.bookingId) : await Booking.findById(req.body.bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    if (req.body.status === "paid" || req.body.paymentStatus === "paid") {
      booking.paymentId = req.body.paymentId || booking.paymentId;
      confirmBooking(booking, "paid");
      if (storageMode === "mongo") await booking.save();
      io.emit("booking:updated", { bookingId: String(booking._id), status: booking.status, paymentStatus: booking.paymentStatus, ticketId: booking.ticketId });
    }
    return res.json({ received: true, ticketId: booking.ticketId || null, status: booking.status });
  } catch (error) {
    return res.status(500).json({ message: "Could not process the payment webhook." });
  }
});

app.post("/api/payments/verify", requireAuth, async (req, res) => {
  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const booking = await getCustomerBooking(bookingId, req.user.id);
    if (!booking || booking.paymentOrderId !== razorpay_order_id) return res.status(400).json({ message: "Payment order does not match this booking." });
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "").update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    if (!process.env.RAZORPAY_KEY_SECRET || expected !== razorpay_signature) {
      booking.paymentStatus = "failed";
      if (storageMode === "mongo") await booking.save();
      return res.status(400).json({ message: "Payment verification failed." });
    }
    booking.paymentId = razorpay_payment_id;
    confirmBooking(booking, "paid");
    if (storageMode === "mongo") await booking.save();
    io.emit("booking:updated", { bookingId: String(booking._id), status: booking.status, paymentStatus: booking.paymentStatus });
    return res.json({ booking, message: "Payment verified." });
  } catch (error) {
    console.error("Payment verification error:", error.message);
    return res.status(500).json({ message: "Could not verify payment." });
  }
});

app.post("/api/bookings/:id/cancel", requireAuth, async (req, res) => {
  try {
    const booking = await getCustomerBooking(req.params.id, req.user.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    if (["in_progress", "completed", "cancelled"].includes(booking.status)) return res.status(409).json({ message: "This booking can no longer be cancelled." });
    booking.status = "cancelled";
    booking.updatedAt = new Date();
    if (storageMode === "mongo") await booking.save();
    io.emit("booking:updated", { bookingId: String(booking._id), status: booking.status, paymentStatus: booking.paymentStatus });
    return res.json(booking);
  } catch (error) {
    console.error("Cancel booking error:", error.message);
    return res.status(500).json({ message: "Could not cancel booking." });
  }
});

app.get("/api/employee/tickets", requireAuth, requireRole("employee"), async (_req, res) => {
  try {
    if (storageMode === "memory") {
      return res.json(memory.bookings.filter((booking) => ["confirmed", "assigned", "arrived", "in_progress"].includes(booking.status)).map((booking) => {
        const customer = memory.users.find((user) => String(user._id) === String(booking.customer));
        return { ...booking, customer: customer ? publicUser(customer) : { name: "Customer", phone: "" } };
      }).filter((booking) => isVisibleTicket(booking, booking.customer)));
    }
    const tickets = await Booking.find({ status: { $in: ["confirmed", "assigned", "arrived", "in_progress"] }, paymentStatus: { $in: ["paid", "demo_paid"] }, ticketId: { $exists: true, $ne: "" } }).populate("customer", "name email phone").sort({ scheduledAt: 1 });
    return res.json(tickets.filter((booking) => isVisibleTicket(booking, booking.customer)));
  } catch (error) {
    return res.status(500).json({ message: "Could not load employee tickets." });
  }
});

app.patch("/api/employee/tickets/:id/accept", requireAuth, requireRole("employee"), async (req, res) => {
  try {
    const booking = storageMode === "memory" ? findMemoryBooking(req.params.id) : await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Ticket not found." });
    if (!["confirmed", "assigned"].includes(booking.status)) return res.status(409).json({ message: "This ticket is no longer available." });
    booking.employee = req.user.id;
    booking.acceptedAt = new Date();
    booking.status = "assigned";
    booking.updatedAt = new Date();
    if (storageMode === "mongo") await booking.save();
    io.emit("booking:updated", { bookingId: String(booking._id), status: booking.status, employeeId: req.user.id, ticketId: booking.ticketId });
    return res.json(booking);
  } catch (error) {
    return res.status(500).json({ message: "Could not accept this ticket." });
  }
});

app.get("/api/admin/bookings", requireAuth, requireOwner, async (_req, res) => {
  try {
    if (storageMode === "memory") {
      return res.json(memory.bookings.map((booking) => {
        const customer = memory.users.find((user) => String(user._id) === String(booking.customer));
        return { ...booking, customer: customer ? publicUser(customer) : { name: "Customer", email: "" } };
      }).filter((booking) => isVisibleTicket(booking, booking.customer)));
    }
    const bookings = await Booking.find({ paymentStatus: { $in: ["paid", "demo_paid"] }, ticketId: { $exists: true, $ne: "" } }).populate("customer", "name email phone").sort({ createdAt: -1 });
    return res.json(bookings.filter((booking) => isVisibleTicket(booking, booking.customer)));
  } catch (error) {
    console.error("Admin bookings error:", error.message);
    return res.status(500).json({ message: "Could not load admin bookings." });
  }
});

app.get("/api/admin/employees", requireAuth, requireOwner, async (_req, res) => {
  try {
    if (storageMode === "memory") {
      const employees = memory.users.filter((user) => user.role === "employee");
      return res.json(employees.map((employee) => ({ ...publicUser(employee), assignedTickets: memory.bookings.filter((booking) => String(booking.employee) === String(employee._id) && isVisibleTicket(booking)).map((booking) => ({ id: booking._id, ticketId: booking.ticketId, status: booking.status, service: booking.items?.map((item) => item.name).join(", ") })) })));
    }
    const employees = await User.find({ role: "employee" }).select("name email phone photoProof role").lean();
    const bookings = await Booking.find({ employee: { $exists: true }, paymentStatus: { $in: ["paid", "demo_paid"] }, ticketId: { $exists: true, $ne: "" } }).select("ticketId status items employee address").lean();
    return res.json(employees.map((employee) => ({ ...publicUser(employee), assignedTickets: bookings.filter((booking) => String(booking.employee) === String(employee._id) && isVisibleTicket(booking)).map((booking) => ({ id: booking._id, ticketId: booking.ticketId, status: booking.status, service: booking.items?.map((item) => item.name).join(", ") })) })));
  } catch (error) {
    console.error("Admin employees error:", error.message);
    return res.status(500).json({ message: "Could not load employees." });
  }
});

app.patch("/api/admin/bookings/:id/status", requireAuth, requireOwner, async (req, res) => {
  const allowed = ["confirmed", "assigned", "arrived", "in_progress", "completed", "cancelled"];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid booking status." });
  try {
    const booking = storageMode === "memory"
      ? findMemoryBooking(req.params.id)
      : await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    booking.status = req.body.status;
    booking.updatedAt = new Date();
    if (storageMode === "mongo") await booking.save();
    io.emit("booking:updated", { bookingId: String(booking._id), status: booking.status, paymentStatus: booking.paymentStatus });
    return res.json(booking);
  } catch (error) {
    console.error("Admin status error:", error.message);
    return res.status(500).json({ message: "Could not update booking status." });
  }
});

app.post("/api/admin/services", requireAuth, requireOwner, async (req, res) => {
  const { name, category, price, description, duration, icon } = req.body;
  if (!String(name || "").trim() || !String(category || "").trim() || !Number.isFinite(Number(price)) || Number(price) < 0) return res.status(400).json({ message: "Name, category, and valid price are required." });
  try {
    const values = { name: String(name).trim(), category: String(category).trim(), price: Number(price), description: String(description || "").trim(), duration: String(duration || "60 min").trim(), icon: icon || "✦", active: true };
    const service = storageMode === "memory" ? { _id: newId(), ...values, createdAt: new Date(), updatedAt: new Date() } : await Service.create(values);
    if (storageMode === "memory") memory.services.push(service);
    return res.status(201).json(service);
  } catch (error) {
    return res.status(500).json({ message: "Could not create service." });
  }
});

app.patch("/api/admin/services/:id", requireAuth, requireOwner, async (req, res) => {
  try {
    const service = storageMode === "memory"
      ? memory.services.find((candidate) => String(candidate._id) === String(req.params.id))
      : await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found." });
    Object.assign(service, req.body, { updatedAt: new Date() });
    if (storageMode === "mongo") await service.save();
    return res.json(service);
  } catch (error) {
    return res.status(500).json({ message: "Could not update service." });
  }
});

io.on("connection", (socket) => socket.emit("quickserve:connected", { connected: true, mode: storageMode }));
app.use((_req, res) => res.status(404).json({ message: "Route not found." }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Unexpected server error." });
});

server.listen(port, () => console.log(`QuickServe API listening on http://localhost:${port} (${storageMode === "mongo" ? "mongo" : "sqlite-local"} mode)`));

mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/quickserve", { serverSelectionTimeoutMS: 2500 })
  .then(async () => {
    await seedMongoIfEmpty();
    storageMode = "mongo";
    console.log("MongoDB connected; persistent mode enabled.");
  })
  .catch((error) => {
    console.warn(`MongoDB unavailable; using local SQLite account mode. ${error.message}`);
  });
