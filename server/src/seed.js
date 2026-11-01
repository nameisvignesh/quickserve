import "dotenv/config";
import mongoose from "mongoose";
import { Service } from "./models.js";
import { defaultServices } from "./catalog.js";
const services = defaultServices;
await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/quickserve");
for (const s of services) await Service.updateOne({ name: s.name }, { $set: s }, { upsert: true });
console.log(`Seeded ${services.length} QuickServe services (Spa & Massage excluded).`);
await mongoose.disconnect();
